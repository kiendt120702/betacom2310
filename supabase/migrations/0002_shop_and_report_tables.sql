CREATE TABLE public.shopee_shops (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status public.shopee_shop_status DEFAULT 'Đang Vận Hành'::public.shopee_shop_status,
    profile_id uuid,
    CONSTRAINT shopee_shops_pkey PRIMARY KEY (id),
    CONSTRAINT shopee_shops_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE public.tiktok_shops (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    profile_id uuid,
    status public.tiktok_shop_status DEFAULT 'Đang Vận Hành'::public.tiktok_shop_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    type public.tiktok_shop_type NOT NULL DEFAULT 'Vận hành'::public.tiktok_shop_type,
    CONSTRAINT tiktok_shops_pkey PRIMARY KEY (id),
    CONSTRAINT tiktok_shops_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE public.shopee_comprehensive_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    report_date date NOT NULL,
    total_revenue numeric,
    total_orders integer,
    average_order_value numeric,
    product_clicks integer,
    total_visits integer,
    conversion_rate numeric,
    cancelled_orders integer,
    cancelled_revenue numeric,
    returned_orders integer,
    returned_revenue numeric,
    total_buyers integer,
    new_buyers integer,
    existing_buyers integer,
    potential_buyers integer,
    buyer_return_rate numeric,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    shop_id uuid,
    feasible_goal numeric,
    breakthrough_goal numeric,
    CONSTRAINT shopee_comprehensive_reports_pkey PRIMARY KEY (id),
    CONSTRAINT shopee_comprehensive_reports_shop_id_fkey FOREIGN KEY (shop_id) REFERENCES public.shopee_shops(id) ON DELETE CASCADE,
    CONSTRAINT shopee_comprehensive_reports_report_date_shop_id_key UNIQUE (report_date, shop_id)
);

CREATE TABLE public.tiktok_comprehensive_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    shop_id uuid,
    report_date date NOT NULL,
    total_revenue numeric,
    total_orders integer,
    total_visits integer,
    conversion_rate numeric,
    returned_revenue numeric,
    total_buyers integer,
    feasible_goal numeric,
    breakthrough_goal numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    platform_subsidized_revenue numeric,
    items_sold integer,
    store_visits integer,
    sku_orders integer,
    cancelled_revenue numeric,
    cancelled_orders integer,
    CONSTRAINT tiktok_comprehensive_reports_pkey PRIMARY KEY (id),
    CONSTRAINT tiktok_comprehensive_reports_shop_id_fkey FOREIGN KEY (shop_id) REFERENCES public.tiktok_shops(id) ON DELETE CASCADE,
    CONSTRAINT tiktok_comprehensive_reports_report_date_shop_id_key UNIQUE (report_date, shop_id)
);