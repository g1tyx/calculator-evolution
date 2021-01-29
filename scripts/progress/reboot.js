(function(){
  rebooting = 0;
})();

function renderResearch() {
  if (game.t2toggle) {
    $('#researchWarp').style.display = "block";
  } else {
    $('#researchWarp').style.display = "none";
  }
  if (calcRPGain().gte(1)) {
    $('#rebootButton').className = "";
  } else {
    $('#rebootButton').className = "disabled";
  }
  $('#rebootDesc').innerHTML = "If you Reboot now, you'll get " + dNotation(calcRPGain(), 4, 0) + " Research Points<br>";
  $('#rebootDesc').innerHTML += "You lose Number, Memory, Base, Upgrades, Money on Reboot<br>";
  if (calcRPGain().lte(1e10)) $('#rebootDesc').innerHTML += "You need to reach " + formatWithBase(calcRPGain().plus(20).pow(6).sub(1).ceil(), game.base) + "(" + game.base + ") to get next RP";
  $('#rpDisplay').innerHTML = "You have " + dNotation(game.researchPoint, 4, 0) + " Research Points";
  for (var i = 0; i < 8; i++) {
    $('.research:nth-of-type(' + (i+1) + ') > .researchProgress > .innerBar').style.width = Math.min(1, game.researchProgress[i])*26 + 'vw';
    $('.research:nth-of-type(' + (i+1) + ') > .researchProgress > .innerBar').style.filter = `hue-rotate(${Math.min(1, game.researchProgress[i])*180}deg)`;
    $('.research:nth-of-type(' + (i+1) + ') > .researchProgress > .researchLevel').innerHTML = 'Lv.' + game.researchLevel[i];
    $('.research:nth-of-type(' + (i+1) + ') > .researchProgress > .researchProgressDisplay').innerHTML = timeNotation(Number(calcResearchDivide(i).div(calcResearchSpeed(game.researchSpeed[i])).valueOf())*(1-game.researchProgress[i])) + ' left';
    // progress number display: ${dNotation(game.researchProgress[i]*calcResearchDivide(i), 2)}/${dNotation(calcResearchDivide(i), 2)}
    $('.research:nth-of-type(' + (i+1) + ') > .researchCost > span:nth-child(1)').innerHTML = dNotation(calcResearchCost(i, 0), 3);
    $('.research:nth-of-type(' + (i+1) + ') > .researchCost > span:nth-child(2) > span').innerHTML = dNotation(calcResearchCost(i, 1), 3);
  }
  [...document.getElementsByClassName("researchMoneyReq")].forEach(ele => {ele.style.display = (game.quantumUpgradeBought.includes('25') ? 'none' : 'inline');});
  $('.research:nth-of-type(4)').style.display = ((game.researchLevel[0]>=1) ? "inline-block" : "none");
  $('.research:nth-of-type(5)').style.display = ((game.researchLevel[0]>=1) ? "inline-block" : "none");
  $('.research:nth-of-type(6)').style.display = ((game.researchLevel[3]>=1) ? "inline-block" : "none");
  $('.research:nth-of-type(7)').style.display = ((game.researchLevel[5]>=1) ? "inline-block" : "none");
  $('.research:nth-of-type(8)').style.display = ((game.researchLevel[6]>=1) ? "inline-block" : "none");
}
function renderOverclockInfo() {
  document.getElementById('overclockInfo').style.display = ((game.researchLevel[0]>=1)?"block":"none");
  document.getElementById('overclockInfo').innerHTML = `Overclock Mult: x${dNotation(getOverclockPower(), 2)}<br>Durability: ${dNotation(game.durability.mul(100), 2)}%`;
}

function reboot() {
  if (!rebooting && calcRPGain().gte(1)) {
    //calculate
    game.researchPoint = game.researchPoint.plus(calcRPGain());
    gotRP = calcRPGain();
    rebootReset();
    game.t2resets = game.t2resets.add(1);

    //animation
    if (calcRebootCooldown() > 1000) commandAppend('reboot', 75);
    rebooting = 1;
    $('#rebootButton').innerHTML = "Rebooting";
    setTimeout( function () {
      rebooting = 0;
      $('#rebootButton').className = "";
      $('#rebootButton').innerHTML = "Reboot";
      if (calcRebootCooldown() > 1000) commandAppend('reboot done! (Got ' + dNotation(gotRP, 4, 0) +' RP)', 75, 1);
    }, calcRebootCooldown());
  }
}
function calcRebootCooldown() {
  return 5000*((2/3)**game.researchLevel[7])/(game.quantumUpgradeBought.includes('42')?5:1);
}
function researchBuy(num) {
  if (game.quantumUpgradeBought.includes('44')) {
    researchMaxBuy(num);
    return;
  }

  if (game.researchPoint.gte(calcResearchCost(num, 0)) && (game.money.gte(calcResearchCost(num, 1)) || game.quantumUpgradeBought.includes('25'))) {
    game.researchPoint = game.researchPoint.sub(calcResearchCost(num, 0));
    if (!game.quantumUpgradeBought.includes('25')) game.money = game.money.sub(calcResearchCost(num, 1));
    game.researchSpeed[num]++;
    renderAll();
  }
}
function researchMaxBuy(num) {
  var mPoint = 10, eachMax = [2**mPoint, 2**mPoint];
  for (var i = 0; i < 2-game.quantumUpgradeBought.includes('25'); i++) {
    for (var j = 0; j < mPoint; j++) {
      eachMax[i] += 2**(mPoint-1-j)*((game[i?'money':'researchPoint'].gte(calcResearchCost(num, i, eachMax[i]-1)))*2-1);
    }
    for (var j = 0; j < 6; j++) {
      if (game[i?'money':'researchPoint'].gt(calcResearchCost(num, i, eachMax[i]))) eachMax[i]++;
      if (game[i?'money':'researchPoint'].lt(calcResearchCost(num, i, eachMax[i]))) eachMax[i]--;
    }
  }
  var bulkLv = Math.min(eachMax[0], eachMax[1]);
  var bulkBuyCount = bulkLv-game.researchSpeed[num]+1;
  if (game.researchPoint.gte(calcResearchCost(num, 0, bulkLv)) && (game.money.gte(calcResearchCost(num, 1, bulkLv)) || game.quantumUpgradeBought.includes('25')) && bulkBuyCount > 0) {
    game.researchPoint = game.researchPoint.sub(calcResearchCost(num, 0, bulkLv));
    if (!game.quantumUpgradeBought.includes('25')) game.money = game.money.sub(calcResearchCost(num, 1, bulkLv));
    game.researchSpeed[num] += bulkBuyCount;
    renderAll();
  }
}

function calcResearch() {
  for (var i = 0; i < 9; i++) {
    game.researchProgress[i] += Number(calcResearchSpeed(game.researchSpeed[i]).div(calcResearchDivide(i)).valueOf())*tGain;
    if (game.researchProgress[i] >= 1) {
      game.researchProgress[i] = 0;
      game.researchLevel[i]++;
    }
  }
  if (game.quantumUpgradeBought.includes('43')) game.researchPoint = game.researchPoint.add(calcRPGain().gt(1) ? calcRPGain().mul(0.3*(1/calcRebootCooldown())*1000).mul(tGain) : 0);
}
function calcRPGain() {
  var tempNum = game.rebootNum.plus(2).pow(1/6).floor().sub(19);
  tempNum = tempNum.mul(D(2).pow(game.researchLevel[6]));
  if (game.quantumUpgradeBought.includes('21')) tempNum = tempNum.mul(10);
  if (game.quantumUpgradeBought.includes('22')) tempNum = tempNum.mul(D(1.2).pow(game.qubit).pow(D.min(game.researchPoint.add(1).log(10).div(25), 1)));
  return Decimal.max(tempNum, 0);
}
function calcResearchCost(idx, type, lv=game.researchSpeed[idx]) {
  switch (idx) {
    case 0:
      return !type ? D(10+Math.sqrt(lv)).pow(lv/1.2) : D(1e10).mul(D(10).pow(lv**2)).pow(lv/100+1).sub(1e10);
      break;
    case 1:
      return !type ? D(10+lv**2).pow(lv) : D(1e10).mul(D(10).pow(lv**2+1)).pow(lv/2+1).sub(1e10);
      break;
    case 2:
      return !type ? D(25).mul(D(2).pow(lv)) : D(1e16).mul(D(10).pow(lv)).pow(Math.sqrt(lv)/4+1);
      break;
    case 3:
      return !type ? D(4e3).mul(D(1.3+lv/15).pow(lv)) : D(1e32).mul(D(10).pow(lv**1.46)).pow(Math.sqrt(lv)/20+1);
      break;
    case 4:
      return !type ? D(3e3).mul(D(1.4+lv/9).pow(lv)) : D(1e30).mul(D(10).pow(lv**1.2)).pow(Math.sqrt(lv)/20+1);
      break;
    case 5:
      return !type ? D(1e6).mul(D(3+lv/5).pow(lv)) : D(1e75).mul(D(lv+10).pow(D(3).pow(lv)));
      break;
    case 6:
      return !type ? D(1e8).mul(D(2+lv).pow(lv)) : D(1e80).mul(D(1e10).pow(lv)).pow(1+(lv/10)**2);
      break;
    case 7:
      return !type ? D(1e9).mul(D(1+lv/5).pow(lv)) : D(1e90).mul(D(1e5).pow(lv)).pow(1+(lv/11)**2);
      break;
    default:
      return D(Infinity);
  }
}
function calcPerResearchSpeedBaseBeforeMult() {
  var baseP = D(100);
  return baseP;
}
function calcPerResearchSpeedBase() {
  var base = calcPerResearchSpeedBaseBeforeMult();
  if (game.quantumUpgradeBought.includes('23')) base = base.mul(10);
  return base;
}
function calcResearchSpeed(lv) {
  if (lv != 0) {
    var tempSpeed = calcPerResearchSpeedBase().pow(lv-1);
    if (game.quantumUpgradeBought.includes('24')) tempSpeed = tempSpeed.mul(D(2).pow(D(game.tLast-game.quantumTime).pow(0.2)).pow(D.min(10, D.max(1, game.researchPoint.log(10).div(20)))));
    return tempSpeed;
  } else {
    return D(0);
  }
}
function calcResearchDivide(num) {
  switch (num) {
    case 0:
    return D(20).mul(factorial(game.researchLevel[num]+1));
      break;
    case 1:
    return D(40).mul(factorial(game.researchLevel[num]*2.5));
      break;
    case 2:
    return D(80).mul(factorial(game.researchLevel[num]*2+1));
      break;
    case 3:
    return D(10).mul(factorial(game.researchLevel[num]));
      break;
    case 4:
    return D(100).mul(factorial(game.researchLevel[num]));
      break;
    case 5:
    return D(10).mul(factorial(game.researchLevel[num]*2));
      break;
    case 6:
    return D(80).mul(factorial(game.researchLevel[num]**1.4));
      break;
    case 7:
    return D(300).mul(factorial(game.researchLevel[num]**2/2));
      break;
    default:
    return D(1e308);
  }
}

getOverclockBasePower = () => { return D.pow(2, game.researchLevel[3]).mul(10) };
function getOverclockPower() {
  if (game.programActive[6]) {
    return getOverclockBasePower().mul(game.durability);
  } else {
    return D(1);
  }
}
