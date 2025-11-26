import { PriceAdjustmentForm } from "@/components/price/PriceAdjustmentForm";

const PriceAdjustment = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Reajuste de Preços
          </h1>
          <p className="mt-2 text-muted-foreground">
            Aplique um reajuste percentual em todos os produtos
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <PriceAdjustmentForm />
        </div>
      </div>
    </div>
  );
};

export default PriceAdjustment;
