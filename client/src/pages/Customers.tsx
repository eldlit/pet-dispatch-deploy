import { FC } from "react";
import CustomerTable from "../components/CustomerTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { mockCustomers } from "../lib/mock-data";

const Customers: FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1556740758-90de374c12ad"
          alt="Customer Service"
          className="hidden lg:block w-48 h-32 rounded-lg object-cover"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers..." className="pl-8" />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <CustomerTable customers={mockCustomers} />
    </div>
  );
};

export default Customers;
