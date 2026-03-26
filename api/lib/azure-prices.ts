import { getPrisma } from './db';


const PRICE_API_URL = 'https://prices.azure.com/api/retail/prices';

export interface AzurePrice {
  currencyCode: string;
  tierMinimumUnits: number;
  retailPrice: number;
  unitPrice: number;
  armRegionName: string;
  location: string;
  effectiveStartDate: string;
  meterId: string;
  meterName: string;
  productId: string;
  productName: string;
  serviceName: string;
  serviceId: string;
  skuId: string;
  skuName: string;
  unitOfMeasure: string;
  isPrimaryRegion: boolean;
  armSkuName: string;
}

export async function fetchAzurePrices(filter: string = "serviceName eq 'Virtual Machines'"): Promise<AzurePrice[]> {
  try {
    const url = new URL(PRICE_API_URL);
    url.searchParams.append('$filter', filter);
    url.searchParams.append('currencyCode', 'JPY');

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json() as { Items: AzurePrice[] };
    return data.Items;
  } catch (error) {
    console.error('Error fetching Azure prices:', error);
    return [];
  }
}

export async function getServicePriceSummary(serviceNames: string[]): Promise<string> {
  try {
    const prisma = await getPrisma();
    // 1. まずデータベースから取得を試みる
    const dbPrices = await prisma.azureServicePrice.findMany({
      where: {
        serviceName: { in: serviceNames }
      }
    });

    let prices: { serviceName: string; skuName: string; retailPrice: number; unitOfMeasure: string; currencyCode: string }[] = dbPrices.map((p: any) => ({
      serviceName: p.serviceName,
      skuName: p.skuName,
      retailPrice: p.unitPrice,
      unitOfMeasure: p.unit,
      currencyCode: p.currency
    }));

    // 2. 足りないサービスがあれば API から取得（可能であればキャッシュするが今回はシンプルに取得のみ）
    const foundServiceNames = dbPrices.map((p: any) => p.serviceName);
    const missingServiceNames = serviceNames.filter(name => !foundServiceNames.includes(name));

    if (missingServiceNames.length > 0) {
      const filter = missingServiceNames.map(s => `serviceName eq '${s}'`).join(' or ');
      const apiPrices = await fetchAzurePrices(filter);

      // API から取得したデータを統合
      prices = [...prices, ...apiPrices.map((p: any) => ({
        serviceName: p.serviceName,
        skuName: p.skuName,
        retailPrice: p.retailPrice,
        unitOfMeasure: p.unitOfMeasure,
        currencyCode: p.currencyCode
      }))];
    }

    if (prices.length === 0) return "価格データの取得に失敗しました。";

    return prices.slice(0, 15).map((p: any) =>
      `- ${p.serviceName} (${p.skuName}): ${p.retailPrice} ${p.currencyCode} per ${p.unitOfMeasure}`
    ).join('\n');
  } catch (error) {
    console.error('Error in getServicePriceSummary:', error);
    return "価格データの取得中にエラーが発生しました。";
  }
}
