import { Routes } from '@angular/router';
import { LoginComponent } from './components/pages/login/login.component';
import { InventoryComponent } from './components/pages/inventory/inventory.component';
import { ReportsComponent } from './components/pages/reports/reports.component';
import { OrdersComponent } from './components/pages/orders/orders.component';
import { StoremanagerComponent } from './components/pages/storemanager/storemanager.component';
import { SalesComponent } from './components/pages/sales/sales.component';
import { CalculatorsComponent } from './components/pages/calculators/calculators.component';
import { SupplierComponent } from './components/pages/supplier/supplier.component';
import { PointofsaleComponent } from './components/pages/pointofsale/pointofsale.component';
import { DebtorsComponent } from './components/pages/debtors/debtors.component';
import { ReturnsComponent } from './components/pages/returns/returns.component';
import { UserprofileComponent } from './components/pages/userprofile/userprofile.component';
import { AddclientComponent } from './components/pages/addclient/addclient.component';
import { NopagefoundComponent } from './components/pages/nopagefound/nopagefound.component';
import { authGuard } from './guard/auth.guard';
import { CompaniesComponent } from './components/pages/admin pages/companies/companies.component';
import { UsersComponent } from './components/pages/admin pages/users/users.component';
import { AnalyticsComponent } from './components/pages/admin pages/analytics/analytics.component';
import { SubscriptionsComponent } from './components/pages/admin pages/subscriptions/subscriptions.component';
import { AdminComponent } from './components/pages/admin/admin.component';
import { CheckoutComponent } from './components/pages/subcomponents/checkout/checkout.component';
import { adminGuard } from './guard/admin.guard';
import { managerGuard } from './guard/manager.guard';
import { AssetsComponent } from './components/pages/assets/assets.component';
import { ExpensesComponent } from './components/pages/expenses/expenses.component';
import { LiabilitiesComponent } from './components/pages/liabilities/liabilities.component';

export const routes: Routes = [
    {
        path: "",
        component: StoremanagerComponent,
        canActivate: [authGuard]
    },

    {
        path: "admin",
        component: AdminComponent,
        canActivate: [authGuard, adminGuard]
    },

    {
        path: "companies",
        component: CompaniesComponent,
        canActivate: [authGuard, adminGuard]
    },

    {
        path: "users",
        component: UsersComponent,
        canActivate: [authGuard, adminGuard]
    },

    {
        path: "checkout",
        component: CheckoutComponent,
        canActivate: [authGuard]
    },

    {
        path: "subscription",
        component: SubscriptionsComponent,
        canActivate: [authGuard, adminGuard]
    },

    {
        path: "analytics",
        component: AnalyticsComponent,
        canActivate: [authGuard, adminGuard]
    },

    {
        path: "login",
       component: LoginComponent,
       
    },



    {
       path: "storemanager",
       component: StoremanagerComponent,
       canActivate: [authGuard, managerGuard]
    },

    {
       path: "inventory",
       component: InventoryComponent,
       canActivate: [authGuard]
    },

    { 
        path: 'suppliers',
        component: SupplierComponent,
        canActivate: [authGuard]
    },
    
    { 
        path: 'orders', 
        component: OrdersComponent,
        canActivate: [authGuard] 
    },

    { 
        path: 'sales', 
        component: SalesComponent,
        canActivate: [authGuard]
    },

    {
        path: 'reports', 
        component: ReportsComponent,
        canActivate: [authGuard, managerGuard]
    },
    {
        path: 'assets', 
        component: AssetsComponent,
        canActivate: [authGuard]
    },
    {
        path: 'expenses', 
        component: ExpensesComponent,
        canActivate: [authGuard]
    },

    {
        path: 'liabilities', 
        component: LiabilitiesComponent,
        canActivate: [authGuard]
    },

    {
        path: 'pointofsale', 
        component: PointofsaleComponent,
        canActivate: [authGuard]
    },

    { 
        path: 'calculators', 
        component: CalculatorsComponent,
        canActivate: [authGuard]
    },

    { 
        path: 'debtors', 
        component: DebtorsComponent,
        canActivate: [authGuard]
    },

    { 
        path: 'returns', 
        component: ReturnsComponent,
        canActivate: [authGuard]
    },

    { 
        path: 'userprofile', 
        component: UserprofileComponent,
        canActivate: [authGuard]
    },
    
    { 
        path: 'addclient', 
        component: AddclientComponent,
        canActivate: [authGuard]
    },


    { path: '**', redirectTo: 'login' }
];
