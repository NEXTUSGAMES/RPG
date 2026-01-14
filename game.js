let hp = 100;

function battle() {
  const damage = Math.floor(Math.random() * 20) + 5;
  hp -= damage;

  const log = document.getElementById("log");
  const hpText = document.getElementById("hp");

  if (hp <= 0) {
    hp = 0;
    log.innerText = "💀 쓰러졌다... 게임 오버!";
  } else {
    log.innerText = `👾 몬스터에게 ${damage}의 피해를 입었다!`;
  }

  hpText.innerText = hp
