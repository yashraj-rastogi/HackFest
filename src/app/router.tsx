import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Home } from '../screens/Home';
import { RecordSale } from '../screens/RecordSale';
import { ManageStock } from '../screens/ManageStock';
import { ProductDetails } from '../screens/ProductDetails';
import { AddProduct } from '../screens/AddProduct';
import { Lists } from '../screens/Lists';
import { Settings } from '../screens/Settings';
import { Welcome } from '../screens/Welcome';
import { ShopType } from '../screens/ShopType';
import { PickItems } from '../screens/PickItems';
import { ShelfWalk } from '../screens/ShelfWalk';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/sale', element: <RecordSale /> },
  { path: '/stock', element: <ManageStock /> },
  { path: '/stock/new', element: <AddProduct /> },
  { path: '/stock/:id', element: <ProductDetails /> },
  { path: '/lists', element: <Lists /> },
  { path: '/more', element: <Settings /> },
  { path: '/welcome', element: <Welcome /> },
  { path: '/setup/type', element: <ShopType /> },
  { path: '/setup/pick', element: <PickItems /> },
  { path: '/setup/walk', element: <ShelfWalk /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
