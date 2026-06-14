import CDP from 'chrome-remote-interface';

async function auditPage(url) {
  console.log(`\n🔍 Auditing Page: ${url}`);
  let client;
  try {
    // Connect to the Chrome instance
    client = await CDP({ port: 9222 });
    const { Page, Runtime, Network } = client;

    // Enable events we need
    await Promise.all([Page.enable(), Runtime.enable(), Network.enable()]);

    const errors = [];
    const logs = [];

    // Capture console API calls (console.log, console.error, console.warn)
    Runtime.consoleAPICalled((params) => {
      const type = params.type;
      const args = params.args.map(a => {
        if (a.value !== undefined) return String(a.value);
        if (a.description !== undefined) return String(a.description);
        return JSON.stringify(a);
      }).join(' ');
      
      if (type === 'error') {
        errors.push(`[Console Error] ${args}`);
      } else {
        logs.push(`[Console ${type}] ${args}`);
      }
    });

    // Capture unhandled exceptions
    Runtime.exceptionThrown((params) => {
      errors.push(`[Unhandled Exception] ${params.exceptionDetails.text || ''} ${params.exceptionDetails.exception?.description || ''}`);
    });

    // Capture network loading failures (e.g. 404s, blocked loads)
    Network.loadingFailed((params) => {
      errors.push(`[Network Failure] Request failed: ${params.errorText}`);
    });

    // Navigate to the target page
    await Page.navigate({ url });
    await Page.loadEventFired();

    // Wait a brief period to let any async calls run and render
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`--- Results for ${url} ---`);
    if (logs.length > 0) {
      console.log('Logs:');
      logs.forEach(l => console.log('  ' + l));
    }
    if (errors.length > 0) {
      console.log('❌ Errors / Exceptions:');
      errors.forEach(e => console.error('  ' + e));
    } else {
      console.log('✅ No errors detected on this page.');
    }

  } catch (err) {
    console.error(`❌ Error auditing ${url}:`, err.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function run() {
  console.log('🚀 Starting browser console audit on http://localhost:5173...');
  try {
    await auditPage('http://localhost:5173/');
    await auditPage('http://localhost:5173/auth');
    await auditPage('http://localhost:5173/calculator');
  } catch (err) {
    console.error('Audit run error:', err);
  }
}

run();
