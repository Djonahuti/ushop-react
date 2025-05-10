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
    sold_count: number;
    manufacturer_id: number;
    p_cat_id: number;
    cat_id: number;
    seller_id: number;
    manufacturers: {
        manufacturer_title: string;
    } | null;
    categories: {
      cat_title: string;
    } | null;
    product_categories: {
      p_cat_title: string;
    } | null;
    sellers: {
        business_name: string;
    }
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

export type Seller = {
    seller_id: number;
    seller_email: string;
    seller_name: string;
    seller_contact: string;
    business_name: string;
    shop_address: string;
    shop_city: string;
    shop_country: string;
    seller_pass?: string;
    seller_image?: string;
    cac_no: string;
};

export type Customer = {
    customer_id: number;
    customer_email: string;
    customer_name: string;
    customer_address: string;
    customer_contact: string;
    state: string;
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
    submitted_at: string;
    customer_id: number;
    feedback_complete: boolean;
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
        seller_id: number;
        sellers: {
            business_name: string;
        };
    } | null;
    order_items:OrderItem[];
    feedbacks: {
        feedback_complete: boolean;        
    };

};

export type OrderItem = {
    order_item_id: number;
    order_id: number;
    product_id: number;
    qty: number;
    size: string;
    orders:{
        order_date: string;
        due_amount: number;
        invoice_no: number;
        order_status: string;
        submitted_at: string;
        customer_id: number;
        customers: {
            customer_name: string;
            customer_email: string;
        } | null;     
    };
    products: {
        product_title: string;
        product_img1: string;
        product_price: number;
        p_cat_id: number;
        cat_id: number;
        manufacturer_id: number;
        seller_id: number;
        sellers: {
            business_name: string;
        };
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
        seller_id: number;
        sellers: {
            business_name: string;
        };
    };
    customers?: {
        customer_name: string;
        customer_image: string;
    };
    created_at: string;
    pending_order_items:{
        qty: number;
        products:{
            product_title: string;
            product_img1: string;
            product_price: number;
        } | null;
    }    
};

export type PendingOrderItems ={
    pending_order_item_id: number;
    pending_order_id: number;
    product_id: number;
    qty: number;
    size: string;
    seller_id: string;
    products: {
        product_title: string;
        product_img1: string;
        product_price: string;
        seller_id: number;
        sellers: {
            business_name: string;
        } | null;
    } | null;
    pending_orders:{
        order_status: string;
        invoice_no: number;
        customers?: {
            customer_name: string;
            customer_image: string;
        };
        created_at: string;
    } | null;
};

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
    is_starred: boolean;
    is_read: boolean;
    customers?: {
        customer_name: string;
        customer_email: string;
        customer_image: string;
    };
    subject?: {
        subject: string;
    }
}

export type Feedback = {
    feedback_id: number;
    created_at: string;
    customer_id: number;
    order_item_id: number | null;
    order_id: number;
    feedtype_id: number;
    feedtype:{
        feedback_type: string;
    };
    comment: string | null;
    rating: number;
    orders?: {
      customers:{
          customer_name:string;
          customer_image:string;
      }
    }
    order_item?:{
      products?:{
          product_id: number;
          product_title: string;
          product_img1: string;
          seller_id: number;
          sellers: {
              business_name: string;
          };
      }
    }
}

export type OrderStatusHistory = {
    id: number;
    order_id: number;
    status: string;
    updated_at: string;
    orders?:{
        invoice_no: number;
    }
}

export type BundleProduct = {
    bundle_product_id: number;
    bundle_id: number;
    product_id: number;
    original_price: number;
    discounted_price: number;
    products:{
        product_title: string;
        product_img1: string;
    }    
};

export type Bundle = {
    bundle_id: number;
    seller_id: number;
    bundle_title: string;
    bundle_description?: string;
    total_price: number;
    created_at: string;
    product_id: number;
    bundle_product:{
        products:{
            product_title: string;
            product_img1: string;
        }
        original_price: number;
        discounted_price: number;
    }
  };
  