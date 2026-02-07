-- Marketing Management Tables
-- Create marketing_strategies table
CREATE TABLE IF NOT EXISTS public.marketing_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('seo', 'social_media', 'content', 'paid_ads', 'email', 'events', 'partnerships', 'other')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    budget DECIMAL(12, 2),
    start_date DATE,
    end_date DATE,
    goals JSONB DEFAULT '[]',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create marketing_tasks table
CREATE TABLE IF NOT EXISTS public.marketing_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    strategy_id UUID REFERENCES public.marketing_strategies(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('seo', 'social_media', 'content', 'paid_ads', 'email', 'events', 'partnerships', 'other')),
    status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'review', 'completed', 'failed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    estimated_hours DECIMAL(6, 2),
    actual_hours DECIMAL(6, 2),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create task_assignments table
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.marketing_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.marketing_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create task_status_history table for audit trail
CREATE TABLE IF NOT EXISTS public.task_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.marketing_tasks(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.marketing_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_strategies
CREATE POLICY "Admin can manage strategies"
    ON public.marketing_strategies FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Gerente can view strategies"
    ON public.marketing_strategies FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- RLS Policies for marketing_tasks
CREATE POLICY "Admin can manage all tasks"
    ON public.marketing_tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Gerente can view assigned tasks"
    ON public.marketing_tasks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.task_assignments
            WHERE task_assignments.task_id = marketing_tasks.id
            AND task_assignments.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
        )
    );

CREATE POLICY "Gerente can update assigned tasks"
    ON public.marketing_tasks FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.task_assignments
            WHERE task_assignments.task_id = marketing_tasks.id
            AND task_assignments.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.task_assignments
            WHERE task_assignments.task_id = marketing_tasks.id
            AND task_assignments.user_id = auth.uid()
        )
    );

-- RLS Policies for task_assignments
CREATE POLICY "Admin can manage assignments"
    ON public.task_assignments FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Users can view their assignments"
    ON public.task_assignments FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
        )
    );

-- RLS Policies for task_comments
CREATE POLICY "Admin can manage all comments"
    ON public.task_comments FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Users can add comments to assigned tasks"
    ON public.task_comments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.task_assignments
            WHERE task_assignments.task_id = task_comments.task_id
            AND task_assignments.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
        )
    );

CREATE POLICY "Users can view comments on assigned tasks"
    ON public.task_comments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.task_assignments
            WHERE task_assignments.task_id = task_comments.task_id
            AND task_assignments.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
        )
    );

-- RLS Policies for task_status_history
CREATE POLICY "Admin can view all history"
    ON public.task_status_history FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Users can view history for assigned tasks"
    ON public.task_status_history FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.task_assignments
            WHERE task_assignments.task_id = task_status_history.task_id
            AND task_assignments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert history for assigned tasks"
    ON public.task_status_history FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.task_assignments
            WHERE task_assignments.task_id = task_status_history.task_id
            AND task_assignments.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
        )
    );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_marketing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketing_strategies_updated_at
    BEFORE UPDATE ON public.marketing_strategies
    FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();

CREATE TRIGGER marketing_tasks_updated_at
    BEFORE UPDATE ON public.marketing_tasks
    FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();

CREATE TRIGGER task_comments_updated_at
    BEFORE UPDATE ON public.task_comments
    FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_tasks_status ON public.marketing_tasks(status);
CREATE INDEX IF NOT EXISTS idx_marketing_tasks_category ON public.marketing_tasks(category);
CREATE INDEX IF NOT EXISTS idx_marketing_tasks_priority ON public.marketing_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_marketing_tasks_due_date ON public.marketing_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_marketing_tasks_strategy ON public.marketing_tasks(strategy_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user ON public.task_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON public.task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_status_history_task ON public.task_status_history(task_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_strategies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_comments TO authenticated;
GRANT SELECT, INSERT ON public.task_status_history TO authenticated;

