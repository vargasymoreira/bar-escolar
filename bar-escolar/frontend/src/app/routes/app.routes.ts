import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';
import { adminGuard } from '../core/guards/admin-guard';

export const routes: Routes = [
  // Ruta por defecto
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  // Rutas de autenticación (públicas)
  {
    path: 'login',
    loadComponent: () =>
      import('../features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../features/auth/register/register').then((m) => m.Register),
  },

  // Rutas para estudiantes (protegidas)
  {
    path: '',
    loadComponent: () =>
      import('../shared/student-layout/student-layout').then(
        (m) => m.StudentLayout
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'menu',
        loadComponent: () =>
          import('../features/estudiante/menu/menu').then((m) => m.Menu),
      },
      {
        path: 'carrito',
        loadComponent: () =>
          import('../features/estudiante/carrito/carrito').then(
            (m) => m.Carrito
          ),
      },
      {
        path: 'mis-pedidos',
        loadComponent: () =>
          import('../features/estudiante/mis-pedidos/mis-pedidos').then(
            (m) => m.MisPedidos
          ),
      },
      {
        path: 'pedido/:id',
        loadComponent: () =>
          import('../features/estudiante/detalle-pedido/detalle-pedido').then(
            (m) => m.DetallePedido
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../features/perfil/perfil').then((m) => m.PerfilComponent),
      },
    ],
  },

  // Rutas para admin (protegidas y solo admin)
  {
    path: 'admin',
    loadComponent: () =>
      import('../shared/admin-layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../features/admin/dashboard/dashboard').then(
            (m) => m.Dashboard
          ),
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('../features/admin/estadisticas/estadisticas').then(
            (m) => m.Estadisticas
          ),
      },
      {
        path: 'gestion-menu',
        loadComponent: () =>
          import('../features/admin/gestion-menu/gestion-menu').then(
            (m) => m.GestionMenu
          ),
      },
      {
        path: 'lista-pedidos',
        loadComponent: () =>
          import('../features/admin/lista-pedidos/lista-pedidos').then(
            (m) => m.ListaPedidos
          ),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('../features/admin/lista-pedidos/lista-pedidos').then(
            (m) => m.ListaPedidos
          ),
      },
      {
        path: 'pedidos/:id',
        loadComponent: () =>
          import(
            '../features/admin/detalle-pedido-admin/detalle-pedido-admin'
          ).then((m) => m.DetallePedidoAdmin),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../features/perfil/perfil').then((m) => m.PerfilComponent),
      },
    ],
  },

  // Ruta 404
  {
    path: '**',
    redirectTo: '/login',
  },
];
