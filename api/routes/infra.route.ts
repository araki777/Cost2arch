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
    Azure Load Balancer, VM, AKS, SWA, Functions, CosmosDB, MySQL, SQL Database, Redis, APIM, Logic Apps, Service Bus, Event Grid, Web PubSub, KeyVault, AI Services, Monitor, App Insights 等から、まるで推し活のように惜しみなくリソースを注ぎ込んだ、予算ギリギリの豪華な構成にして。
    
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
    - グラフ全体の設定: \`digraph G { rankdir=LR; node [fontname="Arial", fontsize=10]; ... }\`
    - 各ノードの設定: \`node_id [label="サービス名\\n(スペック)", shape=none, image="アイコン名", labelloc=b, width=1.2, height=1.2];\`
    - アイコン名の一覧 (image属性に指定):
      - Compute: vm, aks, appservice, functions
      - Web: swa, webpubsub
      - Databases: cosmosdb, mysql, sql, redis
      - Integration: apim, logicapps, servicebus, eventgrid, appconfig
      - Storage: storage
      - Security: keyvault
      - AI: aiservices
      - Networking: frontdoor, lb, vnet, firewall, cdn, dns
      - Monitor: monitor, appinsights, loganalytics
      - Other: user
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

        // アイコンエイリアスを API ローカルの URL に置換
        const ICON_MAP: Record<string, string> = {
            // Compute
            "vm": "/api/icons/compute/10021-icon-service-Virtual-Machine.svg",
            "aks": "/api/icons/compute/10023-icon-service-Kubernetes-Services.svg",
            "appservice": "/api/icons/compute/10035-icon-service-App-Services.svg",
            "functions": "/api/icons/compute/10029-icon-service-Function-Apps.svg",
            
            // Web
            "swa": "/api/icons/web/01007-icon-service-Static-Apps.svg",
            "webpubsub": "/api/icons/new%20icons/02987-icon-service-pubsub.svg",
            
            // Databases
            "cosmosdb": "/api/icons/databases/10121-icon-service-Azure-Cosmos-DB.svg",
            "mysql": "/api/icons/databases/10122-icon-service-Azure-Database-MySQL-Server.svg",
            "sql": "/api/icons/databases/10130-icon-service-SQL-Database.svg",
            "redis": "/api/icons/databases/10137-icon-service-Cache-Redis.svg",
            
            // Integration
            "apim": "/api/icons/integration/10042-icon-service-API-Management-Services.svg",
            "logicapps": "/api/icons/integration/02631-icon-service-Logic-Apps.svg",
            "servicebus": "/api/icons/integration/10836-icon-service-Azure-Service-Bus.svg",
            "eventgrid": "/api/icons/integration/10206-icon-service-Event-Grid-Topics.svg",
            "appconfig": "/api/icons/integration/10219-icon-service-App-Configuration.svg",
            
            // Storage
            "storage": "/api/icons/storage/10086-icon-service-Storage-Accounts.svg",
            
            // Security
            "keyvault": "/api/icons/security/10245-icon-service-Key-Vaults.svg",
            
            // AI
            "aiservices": "/api/icons/ai%20%2B%20machine%20learning/10162-icon-service-Cognitive-Services.svg",
            
            // Networking
            "frontdoor": "/api/icons/networking/10073-icon-service-Front-Door-and-CDN-Profiles.svg",
            "lb": "/api/icons/networking/10062-icon-service-Load-Balancers.svg",
            "vnet": "/api/icons/networking/10061-icon-service-Virtual-Networks.svg",
            "firewall": "/api/icons/networking/10084-icon-service-Firewalls.svg",
            "cdn": "/api/icons/networking/00056-icon-service-CDN-Profiles.svg",
            "dns": "/api/icons/networking/10064-icon-service-DNS-Zones.svg",
            
            // Monitor
            "monitor": "/api/icons/monitor/00001-icon-service-Monitor.svg",
            "appinsights": "/api/icons/monitor/00012-icon-service-Application-Insights.svg",
            "loganalytics": "/api/icons/monitor/00009-icon-service-Log-Analytics-Workspaces.svg",
            
            // Other
            "user": "/api/icons/identity/10230-icon-service-Users.svg",
        };

        let resolvedDot = data.dotCode;
        Object.keys(ICON_MAP).forEach(alias => {
            const regex = new RegExp(`image\\s*=\\s*["']${alias}["']`, 'g');
            resolvedDot = resolvedDot.replace(regex, `image="${ICON_MAP[alias]}"`);
        });
        data.dotCode = resolvedDot;

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
