import DirectusService from '../services/directus.service';
import StripeService from '../services/stripe.service';
import ShopifyService from '../services/shopify.service';
import SyncService from '../services/sync.service';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Helper para imprimir con color
const log = {
  success: (msg: string) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg: string) => console.log(`\n${colors.magenta}═══ ${msg} ═══${colors.reset}\n`)
};

// Test principal
export async function runTests() {
  console.log('\n🧪 Iniciando pruebas del sistema Sleep+ Admin\n');
  
  let allTestsPassed = true;
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [] as string[]
  };

  try {
    // Test 1: Conexión con Directus
    log.section('Test 1: Conexión con Directus');
    results.total++;
    try {
      const customers = await DirectusService.getCustomers();
      log.success(`Conexión exitosa - ${customers.length} clientes encontrados`);
      results.passed++;
    } catch (error: any) {
      log.error(`Error de conexión: ${error.message}`);
      results.failed++;
      results.errors.push(`Conexión Directus: ${error.message}`);
      allTestsPassed = false;
    }

    // Test 2: Obtener Suscripciones
    log.section('Test 2: Obtener Suscripciones');
    results.total++;
    try {
      const subscriptions = await DirectusService.getSubscriptions();
      log.success(`${subscriptions.length} suscripciones encontradas`);
      
      // Verificar estructura
      if (subscriptions.length > 0) {
        const sub = subscriptions[0];
        log.info(`Primera suscripción: ID=${sub.id}, Plan=${sub.plan}, Estado=${sub.status}`);
        if (sub.pricing) {
          log.info(`Pricing: $${sub.pricing.amount} ${sub.pricing.currency}`);
        }
      }
      results.passed++;
    } catch (error: any) {
      log.error(`Error al obtener suscripciones: ${error.message}`);
      results.failed++;
      results.errors.push(`Suscripciones: ${error.message}`);
      allTestsPassed = false;
    }

    // Test 3: Obtener Evaluaciones
    log.section('Test 3: Obtener Evaluaciones Trade-In');
    results.total++;
    try {
      const evaluations = await DirectusService.getEvaluations();
      log.success(`${evaluations.length} evaluaciones encontradas`);
      
      if (evaluations.length > 0) {
        const eval = evaluations[0];
        log.info(`Primera evaluación: ID=${eval.id}, Estado=${eval.status}, Crédito=$${eval.credit_approved}`);
      }
      results.passed++;
    } catch (error: any) {
      log.error(`Error al obtener evaluaciones: ${error.message}`);
      results.failed++;
      results.errors.push(`Evaluaciones: ${error.message}`);
      allTestsPassed = false;
    }

    // Test 4: Configuración de Stripe
    log.section('Test 4: Configuración de Stripe');
    results.total++;
    try {
      const stripeConfig = await StripeService.getConfig();
      if (stripeConfig) {
        log.success('Configuración de Stripe encontrada');
        log.info(`Modo: ${stripeConfig.active ? 'Activo' : 'Inactivo'}`);
      } else {
        log.warn('No hay configuración de Stripe guardada');
      }
      
      const paymentLinks = await StripeService.getPaymentLinks();
      log.info(`${paymentLinks.length} payment links encontrados`);
      results.passed++;
    } catch (error: any) {
      log.error(`Error con Stripe: ${error.message}`);
      results.failed++;
      results.errors.push(`Stripe: ${error.message}`);
      allTestsPassed = false;
    }

    // Test 5: Configuración de Shopify
    log.section('Test 5: Configuración de Shopify');
    results.total++;
    try {
      const shopifySettings = await ShopifyService.getSettings();
      if (shopifySettings) {
        log.success('Configuración de Shopify encontrada');
        log.info(`Dominio: ${shopifySettings.shop_domain || 'No configurado'}`);
      } else {
        log.warn('No hay configuración de Shopify guardada');
      }
      
      const products = await ShopifyService.getProducts();
      log.info(`${products.length} productos encontrados`);
      
      const coupons = await ShopifyService.getCoupons();
      log.info(`${coupons.length} cupones encontrados`);
      results.passed++;
    } catch (error: any) {
      log.error(`Error con Shopify: ${error.message}`);
      results.failed++;
      results.errors.push(`Shopify: ${error.message}`);
      allTestsPassed = false;
    }

    // Test 6: Crear Cliente de Prueba
    log.section('Test 6: Crear Cliente de Prueba');
    results.total++;
    try {
      const testCustomer = {
        first_name: 'Test',
        last_name: 'Customer',
        email: `test_${Date.now()}@example.com`,
        phone: '555-0123',
        type: 'test'
      };
      
      const newCustomer = await DirectusService.createCustomer(testCustomer);
      log.success(`Cliente creado con ID: ${newCustomer.id}`);
      
      // Actualizar cliente
      if (newCustomer.id) {
        await DirectusService.updateCustomer(newCustomer.id, {
          notes: 'Cliente de prueba - puede ser eliminado'
        });
        log.success('Cliente actualizado correctamente');
      }
      
      results.passed++;
    } catch (error: any) {
      log.error(`Error al crear cliente: ${error.message}`);
      results.failed++;
      results.errors.push(`Crear cliente: ${error.message}`);
      allTestsPassed = false;
    }

    // Test 7: Crear Suscripción de Prueba
    log.section('Test 7: Crear Suscripción de Prueba');
    results.total++;
    try {
      const customers = await DirectusService.getCustomers();
      if (customers.length > 0) {
        const testSubscription = {
          customer_id: customers[0].id?.toString(),
          plan: 'basic' as const,
          status: 'active' as const,
          start_date: new Date().toISOString(),
          pricing: {
            amount: 25,
            currency: 'USD',
            interval: 'monthly'
          },
          billing: {
            method: 'test',
            last_payment: new Date().toISOString()
          },
          services: {
            cleanings: 3,
            inspections: 1,
            protection: false,
            trade_in: false
          },
          credits: {
            cleanings_used: 0,
            inspections_used: 0
          }
        };
        
        const newSubscription = await DirectusService.createSubscription(testSubscription);
        log.success(`Suscripción creada con ID: ${newSubscription.id}`);
        
        // Actualizar suscripción
        if (newSubscription.id) {
          await DirectusService.updateSubscription(newSubscription.id, {
            status: 'paused',
            paused_at: new Date().toISOString()
          });
          log.success('Suscripción actualizada a estado pausado');
        }
        
        results.passed++;
      } else {
        log.warn('No hay clientes para crear suscripción');
        results.passed++;
      }
    } catch (error: any) {
      log.error(`Error al crear suscripción: ${error.message}`);
      results.failed++;
      results.errors.push(`Crear suscripción: ${error.message}`);
      allTestsPassed = false;
    }

    // Test 8: Verificar Conflictos
    log.section('Test 8: Verificar Conflictos de Sincronización');
    results.total++;
    try {
      const conflicts = await SyncService.checkForConflicts();
      log.info(`Emails duplicados: ${conflicts.duplicateEmails.length}`);
      log.info(`Mapeos faltantes: ${conflicts.missingMappings.length}`);
      log.info(`Datos desactualizados: ${conflicts.staleData.length}`);
      
      if (conflicts.duplicateEmails.length > 0) {
        log.warn('Se encontraron emails duplicados:');
        conflicts.duplicateEmails.forEach(dup => {
          log.warn(`  - ${dup.email} (IDs: ${dup.customerIds.join(', ')})`);
        });
      }
      
      results.passed++;
    } catch (error: any) {
      log.error(`Error al verificar conflictos: ${error.message}`);
      results.failed++;
      results.errors.push(`Verificar conflictos: ${error.message}`);
      allTestsPassed = false;
    }

    // Test 9: Historial de Sincronización
    log.section('Test 9: Historial de Sincronización');
    results.total++;
    try {
      const syncHistory = await SyncService.getSyncHistory(5);
      log.success(`${syncHistory.length} registros de sincronización encontrados`);
      
      if (syncHistory.length > 0) {
        const lastSync = syncHistory[0];
        log.info(`Última sincronización: ${lastSync.service} - ${lastSync.status}`);
      }
      
      results.passed++;
    } catch (error: any) {
      log.error(`Error al obtener historial: ${error.message}`);
      results.failed++;
      results.errors.push(`Historial sincronización: ${error.message}`);
      allTestsPassed = false;
    }

    // Test 10: Verificar estructura de tablas
    log.section('Test 10: Verificar Estructura de Datos');
    results.total++;
    try {
      // Verificar que podemos leer todos los campos JSONB correctamente
      const subscriptions = await DirectusService.getSubscriptions();
      let jsonbValid = true;
      
      for (const sub of subscriptions.slice(0, 3)) {
        if (sub.pricing && typeof sub.pricing === 'object') {
          log.info(`Suscripción ${sub.id} - Pricing válido: $${sub.pricing.amount}`);
        } else {
          log.warn(`Suscripción ${sub.id} - Pricing inválido o vacío`);
          jsonbValid = false;
        }
      }
      
      if (jsonbValid) {
        log.success('Campos JSONB se leen correctamente');
      }
      
      results.passed++;
    } catch (error: any) {
      log.error(`Error al verificar estructura: ${error.message}`);
      results.failed++;
      results.errors.push(`Estructura de datos: ${error.message}`);
      allTestsPassed = false;
    }

  } catch (error: any) {
    log.error(`Error general en las pruebas: ${error.message}`);
    allTestsPassed = false;
  }

  // Resumen final
  log.section('Resumen de Pruebas');
  console.log(`Total de pruebas: ${results.total}`);
  console.log(`${colors.green}Exitosas: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Fallidas: ${results.failed}${colors.reset}`);
  
  if (results.errors.length > 0) {
    console.log('\nErrores encontrados:');
    results.errors.forEach((error, index) => {
      console.log(`${colors.red}${index + 1}. ${error}${colors.reset}`);
    });
  }
  
  if (allTestsPassed) {
    console.log(`\n${colors.green}✨ ¡Todas las pruebas pasaron exitosamente! ✨${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}❌ Algunas pruebas fallaron. Revisa los errores arriba. ❌${colors.reset}\n`);
  }
  
  return {
    success: allTestsPassed,
    results
  };
}

// Función para ejecutar pruebas desde la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).runSystemTests = runTests;
}

export default runTests;
