import { supabase } from '../supabase';

export const createExecSqlFunction = async () => {
  try {
    // First try to create the function directly
    const { error: directError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$;

        GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
        GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;
      `
    });

    if (directError) {
      // If direct creation fails, try using raw SQL
      const { error: rawError } = await supabase.from('_rpc').insert({
        name: 'exec_sql',
        definition: `
          CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$;
        `
      });

      if (rawError && !rawError.message.includes('already exists')) {
        throw rawError;
      }
    }

    return true;
  } catch (error) {
    console.error('Error creating exec_sql function:', error);
    return false;
  }
};

export const createExecFunction = async () => {
  try {
    // First ensure exec_sql exists
    await createExecSqlFunction();

    // Then create exec function
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.exec(query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE query;
        END;
        $$;

        GRANT EXECUTE ON FUNCTION public.exec(text) TO authenticated;
        GRANT EXECUTE ON FUNCTION public.exec(text) TO anon;
      `
    });

    if (error && !error.message.includes('already exists')) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error creating exec function:', error);
    return false;
  }
};