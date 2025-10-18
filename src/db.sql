-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admins (
  admin_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  admin_name character varying,
  admin_email character varying UNIQUE,
  admin_pass character varying,
  admin_image text,
  admin_contact character varying,
  admin_country text,
  admin_job character varying,
  admin_about text,
  CONSTRAINT admins_pkey PRIMARY KEY (admin_id)
);
CREATE TABLE public.banks (
  bank_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  bank_name text,
  account_number text,
  account_name text,
  logo_url text,
  payment_url text,
  CONSTRAINT banks_pkey PRIMARY KEY (bank_id)
);
CREATE TABLE public.bundle_products (
  bundle_product_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  bundle_id bigint,
  product_id bigint,
  original_price double precision,
  discounted_price double precision,
  CONSTRAINT bundle_products_pkey PRIMARY KEY (bundle_product_id),
  CONSTRAINT bundle_products_bundle_id_fkey FOREIGN KEY (bundle_id) REFERENCES public.bundles(bundle_id),
  CONSTRAINT bundle_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.bundles (
  bundle_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  seller_id bigint,
  bundle_title text NOT NULL,
  bundle_description text,
  total_price double precision NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bundles_pkey PRIMARY KEY (bundle_id),
  CONSTRAINT bundles_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.sellers(seller_id)
);
CREATE TABLE public.cart (
  cart_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_add character varying,
  qty bigint,
  p_price character varying,
  size text,
  product_id bigint,
  customer_id bigint,
  CONSTRAINT cart_pkey PRIMARY KEY (cart_id),
  CONSTRAINT cart_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id),
  CONSTRAINT cart_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.categories (
  cat_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  cat_title text,
  cat_top boolean,
  cat_image text,
  CONSTRAINT categories_pkey PRIMARY KEY (cat_id)
);
CREATE TABLE public.choice_products (
  choice_product_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  choice_id bigint,
  product_id bigint,
  original_price double precision,
  discounted_price double precision,
  CONSTRAINT choice_products_pkey PRIMARY KEY (choice_product_id),
  CONSTRAINT choice_products_choice_id_fkey FOREIGN KEY (choice_id) REFERENCES public.choices(choice_id),
  CONSTRAINT choice_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.choices (
  choice_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  choice_title text NOT NULL,
  choice_description text,
  total_price double precision NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  customer_id bigint,
  CONSTRAINT choices_pkey PRIMARY KEY (choice_id),
  CONSTRAINT choices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id)
);
CREATE TABLE public.contacts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  subject_id bigint,
  message text,
  customer_id bigint,
  is_starred boolean DEFAULT false,
  is_read boolean DEFAULT false,
  CONSTRAINT contacts_pkey PRIMARY KEY (id),
  CONSTRAINT contacts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id),
  CONSTRAINT contacts_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subject(subject_id)
);
CREATE TABLE public.coupons (
  coupon_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  product_id bigint,
  coupon_title character varying,
  coupon_price character varying,
  coupon_code character varying,
  coupon_limit bigint,
  coupon_used bigint,
  CONSTRAINT coupons_pkey PRIMARY KEY (coupon_id),
  CONSTRAINT coupons_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TYPE states AS ENUM (
  'Abuja',
  'Abia State',
  'Adamawa State',
  'Akwa-Ibom State',
  'Anambra State',
  'Bauchi State',
  'Benue State',
  'Bornu State',
  'Cross River State',
  'Delta State',
  'Edo State',
  'Enugu State',
  'Imo State',
  'Jigawa State',
  'Kaduna State',
  'Lagos State',
  'Niger State',
  'Ogun State',
  'Platue State',
  'Rivers State',
  'Kastina State',
  'Osun State',
  'Oyo State',
  'Sokoto State',
  'Taraba State',
  'Kogi State',
  'Ekiti State',
  'Kano State',
  'Bayelsa State'
);
CREATE TABLE public.customers (
  customer_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  customer_name character varying,
  customer_email character varying,
  customer_pass character varying,
  customer_country USER-DEFINED,
  customer_city USER-DEFINED,
  customer_contact character varying,
  customer_address text,
  customer_image text,
  customer_ip character varying,
  customer_confirm_code text,
  provider character varying,
  provider_id character varying,
  state USER-DEFINED,
  CONSTRAINT customers_pkey PRIMARY KEY (customer_id)
);
CREATE TABLE public.feedbacks (
  feedback_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_id bigint NOT NULL,
  order_item_id bigint UNIQUE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  feedtype_id bigint,
  CONSTRAINT feedbacks_pkey PRIMARY KEY (feedback_id),
  CONSTRAINT feedbacky_feedtype_id_fkey FOREIGN KEY (feedtype_id) REFERENCES public.feedtype(feedtype_id),
  CONSTRAINT feedbacky_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id),
  CONSTRAINT feedbacky_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(order_item_id)
);
CREATE TABLE public.feedtype (
  feedtype_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  feedback_type character varying,
  CONSTRAINT feedtype_pkey PRIMARY KEY (feedtype_id)
);
CREATE TABLE public.manufacturers (
  manufacturer_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  manufacturer_title text,
  manufacturer_top boolean,
  manufacturer_image text,
  CONSTRAINT manufacturers_pkey PRIMARY KEY (manufacturer_id)
);
CREATE TABLE public.order_items (
  order_item_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_id bigint NOT NULL,
  product_id bigint NOT NULL,
  qty bigint NOT NULL,
  size text,
  CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.order_status_history (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_id bigint NOT NULL,
  status text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id)
);
CREATE TABLE public.orders (
  order_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  customer_id bigint,
  due_amount bigint,
  invoice_no bigint UNIQUE,
  order_status text,
  order_date timestamp with time zone,
  feedback_complete boolean NOT NULL DEFAULT false,
  CONSTRAINT orders_pkey PRIMARY KEY (order_id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id)
);
CREATE TABLE public.payments (
  payment_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  invoice_no bigint,
  amount bigint,
  payment_mode text,
  ref_no bigint,
  bank_id bigint,
  payment_date text,
  CONSTRAINT payments_pkey PRIMARY KEY (payment_id),
  CONSTRAINT payments_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(bank_id)
);
CREATE TABLE public.pending_order_items (
  pending_order_item_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  pending_order_id bigint NOT NULL,
  product_id bigint NOT NULL,
  qty bigint NOT NULL,
  size text,
  seller_id bigint NOT NULL,
  CONSTRAINT pending_order_items_pkey PRIMARY KEY (pending_order_item_id),
  CONSTRAINT pending_order_items_pending_order_id_fkey FOREIGN KEY (pending_order_id) REFERENCES public.pending_orders(p_order_id),
  CONSTRAINT pending_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT pending_order_items_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.sellers(seller_id)
);
CREATE TABLE public.pending_orders (
  p_order_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  customer_id bigint,
  invoice_no bigint UNIQUE,
  order_status text,
  order_id bigint,
  CONSTRAINT pending_orders_pkey PRIMARY KEY (p_order_id),
  CONSTRAINT pending_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id),
  CONSTRAINT pending_orders_invoice_no_fkey FOREIGN KEY (invoice_no) REFERENCES public.orders(invoice_no),
  CONSTRAINT pending_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id)
);
CREATE TABLE public.product_categories (
  p_cat_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  p_cat_title text,
  p_cat_top boolean,
  p_cat_image text,
  CONSTRAINT product_categories_pkey PRIMARY KEY (p_cat_id)
);
CREATE TABLE public.products (
  product_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  product_title text,
  product_price double precision,
  product_desc character varying,
  product_keywords text,
  product_label text,
  status character varying,
  product_psp_price double precision,
  product_features ARRAY,
  product_url text,
  product_video text,
  product_img1 text,
  product_img2 text,
  product_img3 text,
  cat_id bigint,
  manufacturer_id bigint,
  p_cat_id bigint,
  seller_id bigint,
  item_qty bigint,
  sold_count bigint,
  rating integer DEFAULT 1 CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT products_pkey PRIMARY KEY (product_id),
  CONSTRAINT products_cat_id_fkey FOREIGN KEY (cat_id) REFERENCES public.categories(cat_id),
  CONSTRAINT products_manufacturer_id_fkey FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers(manufacturer_id),
  CONSTRAINT products_p_cat_id_fkey FOREIGN KEY (p_cat_id) REFERENCES public.product_categories(p_cat_id),
  CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.sellers(seller_id)
);
CREATE TABLE public.sellers (
  seller_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  seller_name character varying,
  seller_email character varying UNIQUE,
  seller_pass character varying,
  seller_image text,
  seller_contact character varying,
  shop_country text,
  business_name character varying,
  cac_no character varying,
  shop_address character varying,
  shop_city character varying,
  CONSTRAINT sellers_pkey PRIMARY KEY (seller_id)
);
CREATE TABLE public.state (
  state_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  state USER-DEFINED,
  CONSTRAINT state_pkey PRIMARY KEY (state_id)
);
CREATE TABLE public.subject (
  subject_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  subject text,
  CONSTRAINT subject_pkey PRIMARY KEY (subject_id)
);
CREATE TABLE public.wishlist (
  wishlist_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  customer_id bigint,
  product_id bigint,
  CONSTRAINT wishlist_pkey PRIMARY KEY (wishlist_id),
  CONSTRAINT wishlist_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id),
  CONSTRAINT wishlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);