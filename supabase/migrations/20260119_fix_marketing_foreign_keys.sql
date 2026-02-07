-- =====================================================
-- FIX: Marketing Tables Foreign Keys
-- As tabelas originais referenciavam auth.users, mas o sistema usa admin_users
-- Execute este script para corrigir as referências
-- =====================================================

-- Primeiro, remover as constraints antigas que apontam para auth.users
ALTER TABLE public.task_assignments 
    DROP CONSTRAINT IF EXISTS task_assignments_user_id_fkey,
    DROP CONSTRAINT IF EXISTS task_assignments_assigned_by_fkey;

ALTER TABLE public.task_comments 
    DROP CONSTRAINT IF EXISTS task_comments_user_id_fkey;

ALTER TABLE public.task_status_history 
    DROP CONSTRAINT IF EXISTS task_status_history_changed_by_fkey;

ALTER TABLE public.marketing_strategies 
    DROP CONSTRAINT IF EXISTS marketing_strategies_created_by_fkey;

ALTER TABLE public.marketing_tasks 
    DROP CONSTRAINT IF EXISTS marketing_tasks_created_by_fkey;

-- Agora, adicionar as constraints corretas apontando para admin_users
ALTER TABLE public.task_assignments
    ADD CONSTRAINT task_assignments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE;

ALTER TABLE public.task_assignments
    ADD CONSTRAINT task_assignments_assigned_by_fkey
    FOREIGN KEY (assigned_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;

ALTER TABLE public.task_comments
    ADD CONSTRAINT task_comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE;

ALTER TABLE public.task_status_history
    ADD CONSTRAINT task_status_history_changed_by_fkey
    FOREIGN KEY (changed_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;

ALTER TABLE public.marketing_strategies
    ADD CONSTRAINT marketing_strategies_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;

ALTER TABLE public.marketing_tasks
    ADD CONSTRAINT marketing_tasks_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;

-- Verificar se as constraints foram criadas
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('task_assignments', 'task_comments', 'task_status_history', 'marketing_strategies', 'marketing_tasks')
    AND ccu.table_name = 'admin_users';

