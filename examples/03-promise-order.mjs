// Promiseを返す関数。待つのは呼び出し側がawaitしたときだけ。
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('A: main開始');
  await wait(2000); // ここでmainの続きだけを約2秒待たせる
  console.log('D: awaitの後（約2秒後）');
}

main();

setTimeout(() => {
  console.log('C: 別のタイマー（約1秒後）');
}, 1000);

console.log('B: mainの外側の処理');
