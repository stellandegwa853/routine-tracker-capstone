import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yknqvcmmynfotfkaiisi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbnF2Y21teW5mb3Rma2FpaXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4MzM2NjAsImV4cCI6MjEwODQwOTY2MH0.7aDq9Pw1nc-9I0Rp9vOag8OofI19FqXYsEdXcCBTnQo';


export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;