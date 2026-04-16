'use strict';

/* ========================================================================== */
/* AUTH CONFIG - APPLICATION CONSTANTS                                        */
/* Owner: Foodio Team                                                         */
/* ========================================================================== */

/**
 * Global authentication configuration object
 * Contains static credentials and routing rules
 *//* ملف الثوابت - يحتوي على إعدادات الحسابات الثابتة 
  Owner: Foodio Team
*/
'use strict';

/* ========================================================================== */
/* AUTH CONFIG - APPLICATION CONSTANTS                                        */
/* ========================================================================== */

window.AUTH_CONFIG = {

    /* =========================
       STATIC PASSWORDS (DEV ONLY)
    ========================= */
    STATIC_PASSWORDS: {
        ADMIN: "ADMIN_PASSWORD",
        RESTAURANT: "RESTAURANT_PASSWORD",
        DELIVERY: "DELIVERY_PASSWORD"
    },

    /* =========================
       ROLE-BASED REDIRECT ROUTES
    ========================= */
    REDIRECTS: {
        admin: "admin-dashboard.html",
        restaurant: "restaurant-dashboard.html",
        delivery: "delivery-dashboard.html",
        customer: "user-dashboard.html"
    }
};
window.AUTH_CONFIG = {

    /* =========================
       STATIC PASSWORDS (DEV ONLY)
    ========================= */
    STATIC_PASSWORDS: {

        // Admin account password
        ADMIN: "ADMIN_PASSWORD",

        // Restaurant dashboard password
        RESTAURANT: "RESTAURANT_PASSWORD",

        // Delivery dashboard password
        DELIVERY: "DELIVERY_PASSWORD"
    },


    /* =========================
       ROLE-BASED REDIRECT ROUTES
    ========================= */
    REDIRECTS: {

        // Admin dashboard route
        admin: "admin-dashboard.html",

        // Restaurant dashboard route
        restaurant: "restaurant-dashboard.html",

        // Delivery dashboard route
        delivery: "delivery-dashboard.html",

        // Customer dashboard route (default user)
        customer: "user-dashboard.html"
    }
};