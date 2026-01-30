export type OdooIdName = [number, string];

export type Partner = {
    id: number;
    name: string;
    phone?: string | false;
    mobile?: string | false;
    phone_sanitized?: string | false;
};

export type PartnerConflict = {
    conflict: true;
    e164: string;
    candidates: Partner[];
};

export type PartnerLookupResult = Partner | PartnerConflict | null;

export type SaleOrder = {
    id: number;
    name: string;
    state?: string;
    date_order?: string;
};

export type SaleOrderLine = {
    id: number;
    order_id?: OdooIdName;
    product_id?: OdooIdName;
    product_uom_qty?: number;
};

export type ProductAvailability = {
    qty_available: number;
};

export type AvailabilityMap = Map<number, ProductAvailability>;
