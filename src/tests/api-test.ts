// Script de prueba para ejecutar con Node.js
import fetch from 'node-fetch';

// Configuración
const DIRECTUS_URL = 'https://admin-api-directus.dqyvuv.easypanel.host';
const DIRECTUS_TOKEN = 'mcp_414xdh4vq47mcao0jg2';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Helper para imprimir
const log = {
  success: (msg: string) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg: string) => console.log(`\n${colors.magenta}═══ ${msg} ═══${colors.reset}\n`)
};

// Función para hacer llamadas a la API
async function directusRequest(endpoint: string, options: any = {}) {
  const url = `${DIRECTUS_URL}/items/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

// Tests principales
async function runTests() {
  console.log('\n🧪 Ejecutando pruebas del sistema Sleep+ Admin\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  try {
    // Test 1: Conexión básica
    log.section('Test 1: Conexión con Directus');
    results.total++;
    try {
      const response = await directusRequest('new_customers?limit=5');
      log.success(`Conexión exitosa - ${response.data.length} clientes obtenidos`);
      results.passed++;
    } catch (error: any) {
      log.error(`Error de conexión: ${error.message}`);
      results.failed++;
    }

    // Test 2: Obtener suscripciones
    log.section('Test 2: Obtener Suscripciones');
    results.total++;
    try {
      const response = await directusRequest('subscriptions?limit=5');
      log.success(`${response.data.length} suscripciones encontradas`);
      
      if (response.data.length > 0) {
        const sub = response.data[0];
        log.info(`ID: ${sub.id}`);
        log.info(`Plan: ${sub.plan}`);
        log.info(`Estado: ${sub.status}`);
        if (sub.pricing) {
          log.info(`Precio: $${sub.pricing.amount} ${sub.pricing.currency}`);
        }
      }
      results.passed++;
    } catch (error: any) {
      log.error(`Error: ${error.message}`);
      results.failed++;
    }

    // Test 3: Obtener evaluaciones
    log.section('Test 3: Obtener Evaluaciones Trade-In');
    results.total++;
    try {
      const response = await directusRequest('evaluations?limit=5');
      log.success(`${response.data.length} evaluaciones encontradas`);
      
      if (response.data.length > 0) {
        const eval = response.data[0];
        log.info(`ID: ${eval.id}`);
        log.info(`Estado: ${eval.status}`);
        log.info(`Crédito: $${eval.credit_approved || 0}`);
      }
      results.passed++;
    } catch (error: any) {
      log.error(`Error: ${error.message}`);
      results.failed++;
    }

    // Test 4: Configuración Stripe
    log.section('Test 4: Configuración de Stripe');
    results.total++;
    try {
      const response = await directusRequest('stripe_config?filter[active][_eq]=true');
      if (response.data.length > 0) {
        log.success('Configuración de Stripe encontrada');
        log.info(`Active: ${response.data[0].active}`);
      } else {
        log.warn('No hay configuración de Stripe activa');
      }
      results.passed++;
    } catch (error: any) {
      log.error(`Error: ${error.message}`);
      results.failed++;
    }

    // Test 5: Payment Links
    log.section('Test 5: Payment Links de Stripe');
    results.total++;
    try {
      const response = await directusRequest('stripe_payment_links?limit=10');
      log.success(`${response.data.length} payment links encontrados`);
      results.passed++;
    } catch (error: any) {
      log.error(`Error: ${error.message}`);
      results.failed++;
    }

    // Test 6: Configuración Shopify
    log.section('Test 6: Configuración de Shopify');
    results.total++;
    try {
      const response = await directusRequest('shopify_settings?filter[active][_eq]=true');
      if (response.data.length > 0) {
        log.success('Configuración de Shopify encontrada');
        log.info(`Dominio: ${response.data[0].shop_domain || 'No configurado'}`);
      } else {
        log.warn('No hay configuración de Shopify activa');
      }
      results.passed++;
    } catch (error: any) {
      log.error(`Error: ${error.message}`);
      results.failed++;
    }

    // Test 7: Productos Shopify
    log.section('Test 7: Productos de Shopify');
    results.total++;
    try {
      const response = await directusRequest('shopify_products?limit=5');
      log.success(`${response.data.length} productos encontrados`);
      results.passed++;
    } catch (error: any) {
      log.error(`Error: ${error.message}`);
      results.failed++;
    }

    // Test 8: Cupones Shopify
    log.section('Test 8: Cupones de Shopify');
    results.total++;
    try {
      const response = await directusRequest('shopify_coupons?limit=5');
      log.success(`${response.data.length} cupones encontrados`);
      results.passed++;
    } catch (error: any) {
      log.error(`Error: ${error.message}`);
      results.failed++;
    }

    // Test 9: Crear cliente de prueba
    log.section('Test 9: Crear Cliente de Prueba');
    results.total++;
    try {
      const testCustomer = {
        first_name: 'Test',
        last_name: 'API',
        email: `test_api_${Date.now()}@example.com`,
        phone: '555-9999',
        type: 'test',
        notes: 'Cliente creado por prueba API - puede ser eliminado'
      };

      const response = await directusRequest('new_customers', {
        method: 'POST',
        body: JSON.stringify(testCustomer)
      });

      log.success(`Cliente creado con ID: ${response.data.id}`);
      log.info(`Email: ${response.data.email}`);
      results.passed++;
    } catch (error: any) {
      log.error(`Error al crear cliente: ${error.message}`);
      results.failed++;
    }

    // Test 10: Estructura de datos JSONB
    log.section('Test 10: Verificar Campos JSONB');
    results.total++;
    try {
      const response = await directusRequest('subscriptions?limit=3');
      let jsonbValid = true;
      
      for (const sub of response.data) {
        log.info(`\nSuscripción ${sub.id}:`);
        
        if (sub.pricing && typeof sub.pricing === 'object') {
          log.success(`  - Pricing válido: $${sub.pricing.amount || 0}`);
        } else {
          log.warn(`  - Pricing inválido o vacío`);
          jsonbValid = false;
        }
        
        if (sub.services && typeof sub.services === 'object') {
          log.success(`  - Services válido: ${sub.services.cleanings || 0} limpiezas`);
        } else {
          log.warn(`  - Services inválido o vacío`);
        }
      }
      
      if (jsonbValid) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error: any) {
      log.error(`Error: ${error.message}`);
      results.failed++;
    }

  } catch (error: any) {
    log.error(`Error general: ${error.message}`);
  }

  // Resumen
  log.section('Resumen de Pruebas');
  console.log(`Total de pruebas: ${results.total}`);
  console.log(`${colors.green}Exitosas: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Fallidas: ${results.failed}${colors.reset}`);
  
  const successRate = (results.passed / results.total * 100).toFixed(1);
  
  if (results.failed === 0) {
    console.log(`\n${colors.green}✨ ¡Todas las pruebas pasaron exitosamente! (${successRate}%) ✨${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Tasa de éxito: ${successRate}% ⚠️${colors.reset}\n`);
  }
}

// Ejecutar las pruebas
runTests().catch(console.error);
