export type Product = {
    product_id: number;
    product_title: string;
    product_label: string;
    product_keywords: string;
    product_price: number;
    product_psp_price: number | null;
    product_desc: string;
    product_features: string[];
    product_img1: string;
    product_img2: string;
    product_img3: string;
    product_video: string;
    manufacturer_id: number;
    p_cat_id: number;
    cat_id: number;
    manufacturers: {
        manufacturer_title: string;
    } | null;
    categories: {
      cat_title: string;
    } | null;
    product_categories: {
      p_cat_title: string;
    } | null;
};

export type Category ={
    cat_id: number;
    cat_title: string;
    cat_image: string;
};

export type ProductCategory = {
    p_cat_id: number;
    p_cat_title: string;
    p_cat_image: string;
};

export type Manufacturer = {
    manufacturer_id: number;
    manufacturer_title: string;
    manufacturer_image: string;
};

export type CartItem = {
    product_id: number;
    qty: number;
    p_price: number;
    size: string;
};

export type Customer = {
    customer_id: number;
    customer_email: string;
    customer_name: string;
    customer_address: string;
    customer_contact: string;
    customer_city: string;
    customer_country: string;
    customer_pass?: string;
    customer_image?: string;
    customer_ip: string;
};

export type Order = {
    order_id: number;
    order_date: string;
    order_total: number;
    order_status: string;
    customer_id: number;
    customers: {
        customer_name: string;
    } | null;
};