import xmlrpc from "xmlrpc";
import { config } from "../../config.js";

type XmlRpcClient = {
    methodCall: (method: string, params: unknown[], cb: (err: Error | null, value: unknown) => void) => void;
};

type ExecuteKwArgs = unknown[];

type ExecuteKwKwargs = Record<string, unknown>;

const createClient = (path: string): XmlRpcClient => {
    return xmlrpc.createClient({ url: `${config.ODOO_BASE_URL}${path}` }) as XmlRpcClient;
};

const call = <T>(client: XmlRpcClient, method: string, params: unknown[]): Promise<T> => {
    return new Promise((resolve, reject) => {
        client.methodCall(method, params, (err, value) => (err ? reject(err) : resolve(value as T)));
    });
};

let cached: { uid: number | null; ts: number } = { uid: null, ts: 0 };
const UID_TTL_MS = 5 * 60 * 1000;

export const getUid = async (): Promise<number> => {
    const now = Date.now();

    if (cached.uid && now - cached.ts < UID_TTL_MS) return cached.uid;

    const common = createClient("/xmlrpc/2/common");
    const uid = await call<number>(common, "authenticate", [config.ODOO_DB, config.ODOO_USER, config.ODOO_PASSWORD, {}]);

    if (!uid) throw new Error("Odoo authentication failed");

    cached = { uid, ts: now };

    return uid;
};

export const executeKw = async <T = unknown>(
    model: string,
    method: string,
    args: ExecuteKwArgs = [],
    kwargs: ExecuteKwKwargs = {}
): Promise<T> => {
    const uid = await getUid();
    const object = createClient("/xmlrpc/2/object");

    return call<T>(object, "execute_kw", [config.ODOO_DB, uid, config.ODOO_PASSWORD, model, method, args, kwargs]);
};
