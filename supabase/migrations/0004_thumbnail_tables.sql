CREATE TABLE public.thumbnail_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT thumbnail_categories_pkey PRIMARY KEY (id),
    CONSTRAINT thumbnail_categories_name_key UNIQUE (name)
);

CREATE TABLE public.thumbnail_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT thumbnail_types_pkey PRIMARY KEY (id),
    CONSTRAINT thumbnail_types_name_key UNIQUE (name)
);

CREATE TABLE public.thumbnail_banners (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    image_url text NOT NULL,
    thumbnail_category_id uuid,
    thumbnail_type_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    canva_link text,
    status public.banner_status DEFAULT 'pending'::public.banner_status,
    approved_by uuid,
    approved_at timestamp with time zone,
    CONSTRAINT thumbnail_banners_pkey PRIMARY KEY (id),
    CONSTRAINT thumbnail_banners_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT thumbnail_banners_thumbnail_category_id_fkey FOREIGN KEY (thumbnail_category_id) REFERENCES public.thumbnail_categories(id) ON DELETE SET NULL,
    CONSTRAINT thumbnail_banners_thumbnail_type_id_fkey FOREIGN KEY (thumbnail_type_id) REFERENCES public.thumbnail_types(id) ON DELETE SET NULL,
    CONSTRAINT thumbnail_banners_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE public.thumbnail_likes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    thumbnail_banner_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT thumbnail_likes_pkey PRIMARY KEY (id),
    CONSTRAINT thumbnail_likes_user_id_thumbnail_banner_id_key UNIQUE (user_id, thumbnail_banner_id),
    CONSTRAINT thumbnail_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT thumbnail_likes_thumbnail_banner_id_fkey FOREIGN KEY (thumbnail_banner_id) REFERENCES public.thumbnail_banners(id) ON DELETE CASCADE
);