function myFunction() {
  if (document.getElementById("feeChoice1").checked) {
    rate_value = document.getElementById("feeChoice1").value;
    sellValue = document.getElementById("sprice").value.replace(',', '.');
    buyValue = document.getElementById("bprice").value.replace(',', '.');
    finalTable = sellValue * 0.93 - buyValue;
    if (finalTable >= 0) {
      document.querySelector(".result p").style.color = "green";
      document.querySelector(".result p").innerHTML = finalTable;
    } else if (finalTable < 0) {
      document.querySelector(".result p").style.color = "purple";
      document.querySelector(".result p").innerHTML = finalTable;
    }
  } else if (document.getElementById("feeChoice2").checked) {
    rate_value = document.getElementById("feeChoice2").value;
    sellValue = document.getElementById("sprice").value.replace(',', '.');
    buyValue = document.getElementById("bprice").value.replace(',', '.');
    finalTable = sellValue * 0.91 - buyValue;
    if (finalTable >= 0) {
      document.querySelector(".result p").style.color = "green";
      document.querySelector(".result p").innerHTML = finalTable;
    } else if (finalTable < 0) {
      document.querySelector(".result p").style.color = "purple";
      document.querySelector(".result p").innerHTML = finalTable;
    }
  } else if (document.getElementById("feeChoice3").checked) {
    rate_value = document.getElementById("feeChoice3").value;
    sellValue = document.getElementById("sprice").value.replace(',', '.');
    buyValue = document.getElementById("bprice").value.replace(',', '.');
    finalTable = sellValue * 0.9 - buyValue;
    if (finalTable >= 0) {
      document.querySelector(".result p").style.color = "green";
      document.querySelector(".result p").innerHTML = finalTable;
    } else if (finalTable < 0) {
      document.querySelector(".result p").style.color = "purple";
      document.querySelector(".result p").innerHTML = finalTable;
    }
  } else if (document.getElementById("feeChoice4").checked) {
    rate_value = document.getElementById("feeChoice4").value;
    sellValue = document.getElementById("sprice").value.replace(',', '.');
    buyValue = document.getElementById("bprice").value.replace(',', '.');
    finalTable = sellValue * 0.88 - buyValue;
    if (finalTable >= 0) {
      document.querySelector(".result p").style.color = "green";
      document.querySelector(".result p").innerHTML = finalTable;
    } else if (finalTable < 0) {
      document.querySelector(".result p").style.color = "purple";
      document.querySelector(".result p").innerHTML = finalTable;
    }
  }
}
