import { Heart } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ShopCard } from "@/components/ui/ShopCard";
import { mockShops } from "@/data/mockData";

const SavedShopsPage = () => {
  // Mock saved shops - in real app this would come from user state/database
  const savedShops = mockShops.slice(0, 3);

  return (
    <AppLayout headerTitle="Saved Shops">
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Saved Shops</h1>
          <span className="text-sm text-muted-foreground">
            {savedShops.length} saved
          </span>
        </div>

        {savedShops.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {savedShops.map((shop) => (
              <ShopCard
                key={shop.id}
                id={shop.id}
                name={shop.name}
                image={shop.image}
                rating={shop.rating}
                category={shop.category}
                location={shop.location}
                isSaved={true}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No saved shops yet</h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Tap the bookmark icon on any shop to save it here
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SavedShopsPage;
