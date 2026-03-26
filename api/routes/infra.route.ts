import { Hono } from "hono";
import { fetchGemini } from "../lib/gemini.js";
import { getServicePriceSummary } from "../lib/azure-prices.js";
import { getPrisma } from "../lib/db.js";

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
    {
      "systemName": "システム名（活動内容にちなんだカッコいい名前）",
      "architecture": ["コンポーネント1", "コンポーネント2"],
      "dotCode": "digraph G { ... } // Graphviz形式の構成図コード",
      "monthlyCost": 14800,
      "comment": "『その推し活費用をこれだけのAzureリソースに換算しました！』といった、コンセプトに沿ったエンジニアらしい熱い解説・煽りコメント"
    }
    
    【DOTコードの注意点】:
    - Azureの公式アイコンに近い色使い（ノードのカラー指定など）を反映して。
    - 各ノードにはスペック（Standard_D2s_v3等）をラベルに含めて。
    - 接続関係を明示して（LB -> WebApp -> DBなど）。
    `;
    
    try {
        const result = await fetchGemini(prompt);
        // JSON部分を抽出
        const jsonMatch = result.match(/\{[\s\S]*\}/);
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
