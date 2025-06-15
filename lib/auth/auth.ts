import type { NextAuthOptions } from "next-auth"
import jwt from 'jsonwebtoken'
import AzureADProvider from "next-auth/providers/azure-ad"
import { createOrUpdateUserFromEntraID } from "../db/queries";


// NextAuth の設定オプション
export const authOptions: NextAuthOptions = {
    providers: [
        AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
        tenantId: process.env.AZURE_AD_TENANT_ID ?? "",// tenantIdを指定すると自動でURL組み立ててくれます
        authorization: {
            params: {
            // 必要に応じて追加スコープを指定
            // "offline_access" を含むことでリフレッシュトークン取得も可能
            scope: "openid profile email offline_access offline_access",
            },
        },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
        // 初回ログイン時にアクセストークンやリフレッシュトークンを取り込む
        if (account) {
            token.accessToken = account.access_token;
            token.refreshToken = account.refresh_token;
            token.expiresAt = account.expires_at;
            token.id = account.sub;
        }
        return token;
        },
        async session({ session, token }) {
        // sessionオブジェクトにアクセストークンを格納し、フロントから参照できるように
        // if (token?.accessToken) {
        //     session.accessToken = token.accessToken as string;
        // }
        console.log("token_test: ", token)
        console.log("session_test: ", session.user)
        console.log("session_session: ", session)

        const token_id = jwt.decode(token.accessToken as string)
        if (session.user) {
            // JWT に格納した id を session.user に追加
            // session.user.id = token.sub as string;
            if (token_id && typeof token_id === 'object' && 'oid' in token_id) {
                session.user.id = token_id.oid as string;
                await createOrUpdateUserFromEntraID({
                    id: token_id.oid as string,
                    email: session.user.email as string,
                });
              }
          }
        return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    // NextAuthがセッション情報を暗号化する際に使用
    secret: process.env.NEXTAUTH_SECRET,
};
