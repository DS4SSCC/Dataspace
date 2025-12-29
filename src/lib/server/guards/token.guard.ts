import type {GuardInput} from "$lib/server/helpers/guard.helper";
import {error} from "@sveltejs/kit";
import {type JWTHeader, type JWTPayload, verify} from "@sourceregistry/node-jwt";
import {KeyStore} from "$lib/server/configurations/keystore.configuration";

export const TokenGuard = {
    require: (input: GuardInput) => {
        const bearer = input.request.headers.get("Authorization")
        if (!bearer || !bearer.startsWith("Bearer ")) return error(403, {message: 'Authorization required'});
        const jwt = verify(bearer.split(" ")[1], KeyStore.public)
        if (!jwt.valid) return error(403, {message: 'Authorization required'});
        return {
            jwt: jwt as {
                valid: true;
                header: JWTHeader;
                payload: JWTPayload;
                signature: string;
            },
            token: jwt.payload
        }
    }
}
