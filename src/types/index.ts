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
    cart_id: number;
    product_id: number;
    qty: number;
    p_price: number;
    size: string;
    products: {
        product_title: string;
        product_img1: string;
    }
};

export type Admin = {
    admin_id: number;
    admin_email: string;
    admin_name: string;
    admin_contact: string;
    admin_about: string;
    admin_country: string;
    admin_pass?: string;
    admin_image?: string;
    admin_job: string;
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
    due_amount: number;
    invoice_no: number;
    qty: number;
    size: string;
    order_status: string;
    customer_id: number;
    customers: {
        customer_name: string;
        customer_email: string;
    } | null;
    product_id: number;
    products: {
        product_title: string;
        product_img1: string;
        product_price: number;
        p_cat_id: number;
        cat_id: number;
        manufacturer_id: number;
    } | null;
};

export type WishlistItem = {
    wishlist_id: number;
    product_id: number;
    products: {
        product_title: string;
        product_img1: string;
        product_price: number;
        product_psp_price: number;
        manufacrurer_id: number;
        manufacturers: {
            manufacturer_title: string;
        }
    };
}

export type Coupon = {
    coupon_id: number;
    coupon_code: string;
    coupon_price: number;
    coupon_limit: number;
    coupon_used: number;
};

export type PendingOrder = {
    p_order_id: number;
    invoice_no: number;
    qty: number;
    size: string;
    order_status: string;
    products?: {
        product_title: string;
        product_img1: string;
        product_price: number;
    };
    customers?: {
        customer_name: string;
        customer_image: string;
    };
    created_at: string;
}

export type Bank = {
    bank_id: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    logo_url: string;
    payment_url: string;
}

export type Payment = {
    payment_id: number;
    ref_no: number;
    invoice_no: number;
    payment_date: string;
    payment_mode: string;
    bank_id: number;
    banks?: {
        bank_name: string;
    }
    amount: number;
}

export type Contact = {
    id: number;
    customer_id: number;
    subject_id: number;
    message: Text;
    submitted_at: string;
    customers?: {
        customer_name: string;
        customer_email: string;
    };
    subject?: {
        subject: string;
    }
}

export type Feedback = {
    feedback_id: number;
    created_at: string;
    customer_id: number;
    product_id: number;
    order_id: number;
    orders?:{
        invoice_no: number;
    };
    feedtype_id: number;
    feedtype?:{
        feedback_type: string;
    };
    comment: Text;
    rating: number;
    customers?:{
        customer_name:string;
        customer_image:string;
    };
    products?:{
        product_title: string;
        product_img1: string;
    };
}