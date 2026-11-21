import { supabase } from '../supabaseClient';

// Load the app profile (public.users row) that belongs to the signed-in Supabase Auth user.
// Row Level Security only lets a student read their own row, so this can't leak other users.
export async function fetchProfile(authUserId) {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, full_name, student_id, email, role, account_status, student_profiles(degree_program)')
    .eq('auth_id', authUserId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const profile = Array.isArray(data.student_profiles)
    ? data.student_profiles[0]
    : data.student_profiles;

  return {
    userId: data.user_id,
    fullName: data.full_name,
    studentId: data.student_id,
    email: data.email,
    role: (data.role || 'STUDENT').toUpperCase(),
    accountStatus: data.account_status,
    degreeProgram: profile?.degree_program || null
  };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });
  if (error) {
    if (error.message === 'Invalid login credentials') {
      throw new Error(
        'Incorrect email or password. If you created your account before the login upgrade, register again with the same email to keep your records.'
      );
    }
    throw error;
  }

  const profile = await fetchProfile(data.user.id);
  if (!profile) {
    await supabase.auth.signOut();
    throw new Error('Your account has no student profile. Please contact Administration.');
  }
  if (profile.accountStatus !== 'Active') {
    await supabase.auth.signOut();
    throw new Error('Account is suspended or flagged. Please contact Administration.');
  }
  return profile;
}

// Returns the profile when the user is signed in right away, or null when Supabase
// requires them to confirm their email first.
export async function signUp({ email, password, fullName, studentId, degreeProgram }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        student_id: studentId.trim(),
        degree_program: degreeProgram
      }
    }
  });

  if (error) {
    if (error.message?.includes('Database error')) {
      throw new Error('Could not create your profile. That Student ID may already be registered.');
    }
    throw error;
  }

  // Supabase returns a user with no identities when the email is already registered.
  if (data.user && data.user.identities?.length === 0) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  if (!data.session) return null;

  const profile = await fetchProfile(data.user.id);
  if (!profile) throw new Error('Your account was created but the profile could not be loaded. Please sign in.');
  return profile;
}

export async function signOut() {
  await supabase.auth.signOut();
}
