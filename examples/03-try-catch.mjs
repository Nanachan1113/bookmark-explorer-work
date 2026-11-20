async function load(fakeError){
 if(fakeError) throw new Error('模擬的な読込失敗');
 return ['A','B'];
}
try {
 const values=await load(true);
 console.log(values);
} catch (error) {
 console.error(error instanceof Error?error.message:String(error));
} finally {
 console.log('読込処理の終了');
}
