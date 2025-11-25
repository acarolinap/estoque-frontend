import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { AuthForm } from "@/components/auth/AuthForm";

import Products from "./Products";
import Categories from "./Categories";
import StockMovements from "./StockMovements";
import PriceAdjustment from "./PriceAdjustment";
import Reports from "./Reports";

import { Button } from "@/components/ui/button";
import { LogOut, Package, Tags, TrendingUp, DollarSign, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    
    const checkAuth = async () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    setIsAuthenticated(false);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
      <Tabs defaultValue="products" className="w-full">
        <div className="container mx-auto px-4 pt-8">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-5">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Tags className="h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="stock" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="price" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Reajuste
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="products" className="mt-0">
          <Products />
        </TabsContent>
        <TabsContent value="categories" className="mt-0">
          <Categories />
        </TabsContent>
        <TabsContent value="stock" className="mt-0">
          <StockMovements />
        </TabsContent>
        <TabsContent value="price" className="mt-0">
          <PriceAdjustment />
        </TabsContent>
        <TabsContent value="reports" className="mt-0">
          <Reports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;