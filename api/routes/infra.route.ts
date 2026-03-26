import { Hono } from "hono";
import { fetchGemini } from "../lib/gemini";
import { getServicePriceSummary } from "../lib/azure-prices";
import { getPrisma } from "../lib/db";

const router = new Hono();

router.post("/generate", async (c) => {
    const { amount, activityName } = await c.req.json();

    // 代表的なサービスの最新価格を取得
    const priceInfo = await getServicePriceSummary([
        'Virtual Machines',
        'Azure SQL Database',
        'Storage Accounts',
        'App Service'
    ]);

    const prompt = `
    あなたが「${activityName}」という推し活に費やしている月間予算 ${amount}円を、そのまま Azure のインフラ構成に充てるとしたら、どんな豪華で面白いシステムができるか提案して。
    
    【最新の価格参考情報 (目安)】:
    ${priceInfo}
    
    【構成に含めるべき要素】:
    Azure Load Balancer, VM, AKS, SWA, CosmosDB, MySQL, APIM, Web PubSub, KeyVault, AI Services 等から、まるで推し活のように惜しみなくリソースを注ぎ込んだ、予算ギリギリの豪華な構成にして。
    
    【出力形式 (JSONのみ)】:
    JSON内の "dotCode" は、必ず一行の文字列（改行を \n に置換したもの）として出力してください。
    {
    "systemName": "...",
    "architecture": [...],
    "dotCode": "digraph G { rankdir=LR; node [shape=box, color=\\"#0078D4\\", fontname=\\"Arial\\"]; ... }",
    "monthlyCost": 14800,
    "comment": "..."
    }

    【DOTコードの具体的な制約】:
    - 必ず \`digraph G { ... }\` で開始すること。
    - Azureの青色（#0078D4）をノードのcolorに指定して。
    - 接続は \`->\` を使用して。
    最後に、一切の解説を省き、純粋なJSONオブジェクトのみを出力してください。
    \`\`\`json
    { ... }
    \`\`\`
    `;

    try {
        const result = await fetchGemini(prompt);

        const cleanResult = result.replace(/```json|```/g, "").trim();

        // JSON部分を抽出
        const jsonMatch = cleanResult.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid Gemini response");

        const data = JSON.parse(jsonMatch[0]);

        // DBに保存
        try {
            const prisma = await getPrisma();
            await prisma.architectureResult.create({
                data: {
                    systemName: data.systemName,
                    activityName: activityName,
                    totalCost: data.monthlyCost,
                    architecture: JSON.stringify(data.architecture),
                    dotCode: data.dotCode,
                    comment: data.comment
                }
            });
        } catch (dbError) {
            console.error("DB Save Error:", dbError);
            // DB保存失敗してもレスポンスは返す
        }

        return c.json(data);
    } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to generate infrastructure" }, 500);
    }
});

export default router;
