(async () => {
   try {
      const res1 = await fetch('http://localhost:5000/api/members');
      const members = await res1.json();
      const alice = members.find((m: any) => m.id === 1);
      console.log('1. Alice Initial Fine Balance:', alice.fineBalance);

      console.log('2. Recording 2000 MK Partial Payment for Alice...');
      const res2 = await fetch('http://localhost:5000/api/payments', {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ memberId: 1, amount: 2000, note: 'Test Partial payment' })
      });
      const paymentData = await res2.json();
      console.log('   -> Payment success, new payment ID:', paymentData.id);

      const res3 = await fetch('http://localhost:5000/api/members');
      const membersFinal = await res3.json();
      const aliceFinal = membersFinal.find((m: any) => m.id === 1);
      console.log('3. Alice Final Fine Balance:', aliceFinal.fineBalance);
      
      const success = aliceFinal.fineBalance === (alice.fineBalance - 2000);
      console.log(`\nTEST ${success ? 'PASSED ✅' : 'FAILED ❌'}: Balance dynamically decremented properly!`);
      
   } catch (e) {
      console.error(e);
   }
})();
