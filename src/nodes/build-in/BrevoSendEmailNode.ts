import { BaseNode } from '../core/BaseNode'
export type BrevoSendEmailParams = {
    to: string;
    subject: string;
    html: string;
    sender?: string;
}

export class BrevoSendEmailNode extends BaseNode<BrevoSendEmailParams> {
    name = "Node brevom send email";
    description = "Node Brevo santuy";
    parameters = [];
    async execute(ctx: { params: BrevoSendEmailParams }) {
        const { to, html, subject, sender } = ctx.params
        const apiKey = process.env.BREVO_API_KEY
        console.log(apiKey)

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "api-key": apiKey!,
            },
            body: JSON.stringify({
                sender: { email: "admin@vaultsy.online" },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html
            }),
        })

        const data = await response.json()
        if (!response.ok) {
            console.error("Brevo Error:", data);
            throw new Error(data.message || "Gagal mengirim email Brevo");
        }
        return  {
            ...ctx, 
            result: data

        }
    }
}