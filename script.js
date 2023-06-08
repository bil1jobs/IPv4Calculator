const adresse = document.getElementById("adresse");
const reseau = document.getElementById("reseau");
const masque = document.getElementById("masque");
const masqueSR = document.getElementById("masqueSousReseau");
const diffusion = document.getElementById("diffusion");
const nbrMachine = document.getElementById("nbrMachine");
const nbrSousReseau = document.getElementById("nbrSousReseau");
const plage = document.getElementById("plage");
const table = document.getElementById("table");
const reseauClone = document.getElementById("reseau-clone");
const masqueClone = document.getElementById("masque-clone");
const masqueSRClone = document.getElementById("masqueSousReseau-clone");
const diffusionClone = document.getElementById("diffusion-clone");
const plageClone = document.getElementById("plage-clone");
const limit = 2048;
const halfLimit = limit / 2;
// ------------------------------------ CLASSES SECTION ------------------------------------
class NetworkAddress {
  constructor(adresseValue) {
    let regex =
      /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(30|[1-2][0-9]|[8-9])$/;
    let defaultRegex = /^(0)\.(0)\.(0)\.(0)\/(30|[1-2][0-9]|[1-9])$/;
    let match = regex.test(adresseValue);
    let defaultMatch = defaultRegex.test(adresseValue);
    if (match) {
      [
        this.adresse,
        this.masque,
        this.firstOctet,
        this.secondOctet,
        this.thirdOctet,
        this.fourthOctet,
      ] = splitAddress(adresseValue);

      this.binaryAdress = this.toBinary();

      [this.partieReseau, this.partieMachine] = [
        this.binaryAdress.substring(0, this.masque),
        this.binaryAdress.substring(this.masque, 32),
      ];
    } else if (defaultMatch) {
      alert("It's the default address, try another one!");
    } else {
      alert("It's not a valid address!");
    }
  }

  toBinary() {
    return (
      octal(parseInt(this.firstOctet).toString(2)) +
      octal(parseInt(this.secondOctet).toString(2)) +
      octal(parseInt(this.thirdOctet).toString(2)) +
      octal(parseInt(this.fourthOctet).toString(2))
    );
  }
  adresseReseau() {
    let adresseReseau =
      this.partieReseau + "0".repeat(this.partieMachine.length);
    return xReseau(adresseReseau);
  }
  adresseReseauBinaire() {
    let adresseReseau =
      this.partieReseau + "0".repeat(this.partieMachine.length);
    return adresseReseau;
  }
  adresseReseauBinaireNext() {
    let adresseReseau =
      addBinary(this.partieReseau, "1") + "0".repeat(this.partieMachine.length);
    return adresseReseau;
  }
  diffusionReseau() {
    let diffusionReseau =
      this.partieReseau + "1".repeat(this.partieMachine.length);
    return xReseau(diffusionReseau);
  }
  masqueReseau() {
    let masqueReseau =
      "1".repeat(this.partieReseau.length) +
      "0".repeat(this.partieMachine.length);
    return xReseau(masqueReseau);
  }
  plageReseau() {
    let adresseReseau =
      this.partieReseau + "0".repeat(this.partieMachine.length - 1) + "1";
    let diffusionReseau =
      this.partieReseau + "1".repeat(this.partieMachine.length - 1) + "0";
    return xReseau(adresseReseau) + "-" + xReseau(diffusionReseau);
  }
}

class SubnetAddress {
  constructor(nbrMachine, nbrSousReseau) {
    (this.nbrMachine = nbrMachine),
      (this.nbrSousReseau = nbrSousReseau),
      (this.sousReseauArray = []);
  }
  fillArray(NA) {
    for (let i = 0; i < this.nbrSousReseau; i++) {
      let sousReseau = new NetworkAddress(
        xReseau(
          addBinary(
            NA.adresseReseauBinaire(),
            parseInt(this.nbrMachine * i).toString(2)
          )
        ) +
          "/" +
          (parseInt(NA.masque) + Math.log2(this.nbrSousReseau)).toString()
      );
      this.sousReseauArray.push(sousReseau);
    }
  }
  fillComplexArray(NA) {
    for (let i = 0; i < halfLimit; i++) {
      let sousReseau = new NetworkAddress(
        xReseau(
          addBinary(
            NA.adresseReseauBinaire(),
            parseInt(this.nbrMachine * i).toString(2)
          )
        ) +
          "/" +
          (parseInt(NA.masque) + Math.log2(this.nbrSousReseau)).toString()
      );
      this.sousReseauArray.push(sousReseau);
    }
    let tempArray = [];
    for (let i = 1; i <= halfLimit; i++) {
      let sousReseau = new NetworkAddress(
        xReseau(
          subtractBinary(
            NA.adresseReseauBinaireNext(),
            parseInt(this.nbrMachine * i).toString(2)
          )
        ) +
          "/" +
          (parseInt(NA.masque) + Math.log2(this.nbrSousReseau)).toString()
      );
      tempArray.push(sousReseau);
    }
    tempArray.reverse();
    for (let i = 0; i < halfLimit; i++) {
      this.sousReseauArray.push(tempArray[i]);
    }
  }
  setSousReseauArray(NA) {
    if (this.nbrSousReseau <= limit) {
      this.fillArray(NA);
    } else {
      this.fillComplexArray(NA);
    }
  }
  getSousReseau() {
    return this.sousReseauArray[0];
  }
  getSousReseauArray() {
    return this.sousReseauArray;
  }
}
// ------------------------------------ FUNCTIONS SECTION ------------------------------------

function splitAddress(adresseValue) {
  return [
    adresseValue.split("/")[0],
    adresseValue.split("/")[1],
    ...adresseValue.split("/")[0].split("."),
  ];
}
function octal(octet) {
  while (octet.length < 8) {
    octet = "0" + octet;
  }
  return octet;
}

function xReseau(xReseau) {
  return (
    parseInt(xReseau.substring(0, 8), 2).toString() +
    "." +
    parseInt(xReseau.substring(8, 16), 2).toString() +
    "." +
    parseInt(xReseau.substring(16, 24), 2).toString() +
    "." +
    parseInt(xReseau.substring(24, 32), 2).toString()
  );
}

function quadFill(NA) {
  reseau.value = NA.adresseReseau();
  diffusion.value = NA.diffusionReseau();
  masque.value = NA.masqueReseau();
  plage.value = NA.plageReseau();
}
function nbrSelection(NA) {
  nbrMachine.innerHTML = "<option selected disabled> Choose a Number </option>";
  nbrSousReseau.innerHTML =
    "<option selected disabled> Choose a Number </option>";
  for (let i = 2; i < 33 - NA.masque; i++) {
    let option = document.createElement("option");
    option.innerHTML = Math.pow(2, i);
    nbrMachine.append(option);
  }
  let option = document.createElement("option");
  option.innerHTML = "Other";
  nbrMachine.append(option);

  for (let i = 0; i < 31 - NA.masque; i++) {
    let secondOption = document.createElement("option");
    secondOption.innerHTML = Math.pow(2, i);
    nbrSousReseau.append(secondOption);
  }
  let secondOption = document.createElement("option");
  secondOption.innerHTML = "Other";
  nbrSousReseau.append(secondOption);
}
function createSousReseaux(NA) {
  let sousReseau = new SubnetAddress(nbrMachine.value, nbrSousReseau.value);
  sousReseau.setSousReseauArray(NA);
  masqueSR.value = sousReseau.getSousReseau().masqueReseau();
  masqueSRClone.value = masqueSR.value;
  return sousReseau.getSousReseauArray();
}
function displayCreatedSousReseaux(array) {
  let html = `<tr>
  <th>SubnetID</th>
  <th>Subnet Address</th>
  <th>IP Address Pool</th>
  <th>Subnet Broadcast Address</th>
</tr>`;

  if (nbrSousReseau.value <= limit) {
    for (let i = 0; i < array.length; i++) {
      html += `<tr>
    <td>${i + 1}</td>
    <td>${array[i].adresseReseau()}</td>
    <td>${array[i].plageReseau()}</td>
    <td>${array[i].diffusionReseau()}</td>
  </tr>`;
    }
  } else {
    for (let i = 0; i < array.length / 2; i++) {
      html += `<tr>
    <td>${i + 1}</td>
    <td>${array[i].adresseReseau()}</td>
    <td>${array[i].plageReseau()}</td>
    <td>${array[i].diffusionReseau()}</td>
  </tr>`;
    }
    for (let i = 0; i < 3; i++) {
      html += `<tr>
    <td>${"---"}</td>
    <td>${"---"}</td>
    <td>${"---"}</td>
    <td>${"---"}</td>
  </tr>`;
    }
    let i = array.length / 2 - 1;
    for (
      let j = nbrSousReseau.value - array.length / 2 + 1;
      j <= nbrSousReseau.value;
      j++
    ) {
      i++;
      html += `<tr>
    <td>${j}</td>
    <td>${array[i].adresseReseau()}</td>
    <td>${array[i].plageReseau()}</td>
    <td>${array[i].diffusionReseau()}</td>
  </tr>`;
    }
  }
  table.innerHTML = html;
}

function addBinary(a, b) {
  let result = "";
  let carry = 0;
  let i = a.length - 1;
  let j = b.length - 1;

  while (i >= 0 || j >= 0) {
    let sum = carry;

    if (i >= 0) {
      sum += parseInt(a[i], 10);
      i--;
    }

    if (j >= 0) {
      sum += parseInt(b[j], 10);
      j--;
    }

    carry = sum >> 1;
    result = (sum & 1) + result;
  }

  if (carry) {
    result = carry + result;
  }

  return result;
}
function subtractBinary(a, b) {
  while (a.length < b.length) {
    a = "0" + a;
  }
  while (b.length < a.length) {
    b = "0" + b;
  }

  let result = "";
  let borrow = 0;
  let i = a.length - 1;
  let j = b.length - 1;

  while (i >= 0) {
    let diff = parseInt(a[i], 2) - parseInt(b[j], 2) - borrow;

    if (diff < 0) {
      diff += 2;
      borrow = 1;
    } else {
      borrow = 0;
    }

    result = diff.toString() + result;
    i--;
    j--;
  }

  while (result[0] === "0" && result.length > 1) {
    result = result.slice(1);
  }

  return result;
}

function copyToClone() {
  reseauClone.value = reseau.value;
  masqueClone.value = masque.value;
  diffusionClone.value = diffusion.value;
  plageClone.value = plage.value;
}
function refreshSubnetting() {
  masqueSR.value = "";
  masqueSRClone.value = masqueSR.value;
  table.innerHTML = `<tr>
        <th>SubnetID</th>
        <th>Subnet Address</th>
        <th>IP Address Pool</th>
        <th>Subnet Broadcast Address</th>
      </tr>
      <tr>
        <td>---</td>
        <td>---</td>
        <td>---</td>
        <td>---</td>
      </tr>
      <tr>
        <td>---</td>
        <td>---</td>
        <td>---</td>
        <td>---</td>
      </tr>`;
}

function findNextPowerOfTwo(number) {
  // Check if the input is already a power of 2
  if ((number & (number - 1)) === 0) {
    return number;
  }
  // Find the nearest power of 2 greater than the input number
  let nextPowerOfTwo = 1;
  while (nextPowerOfTwo < number) {
    nextPowerOfTwo <<= 1; // Shift bits to the left (multiply by 2)
  }
  return nextPowerOfTwo;
}

// ------------------------------------ EVENTLISTENERS SECTION ------------------------------------
let NA;
adresse.addEventListener("change", () => {
  NA = new NetworkAddress(adresse.value);
  if (NA.adresse) {
    quadFill(NA);
    nbrSelection(NA);
    copyToClone();
    refreshSubnetting();
  }
});

nbrMachine.addEventListener("change", (e) => {
  let selectedOption = e.target.options[e.target.selectedIndex];
  let maxMachine = parseInt(nbrMachine.lastChild.previousSibling.value);
  let find;
  if (selectedOption.value != "Other") {
    nbrSousReseau.value = maxMachine / parseInt(nbrMachine.value);
    displayCreatedSousReseaux(createSousReseaux(NA));
  } else {
    do {
      var userInput = prompt(
        "Please enter an IP/Subnet Number of your choice:",
        ""
      );
      number = parseInt(userInput);
    } while (
      number > maxMachine ||
      number == 0 ||
      userInput == "" ||
      userInput == null
    );

    for (let i = 0; i < nbrMachine.options.length; i++) {
      if (findNextPowerOfTwo(number) <= 2) find = 4;
      else find = findNextPowerOfTwo(number);
      if (find == nbrMachine.options[i].value) {
        nbrMachine.value = find;
        nbrSousReseau.value = parseInt(maxMachine) / parseInt(nbrMachine.value);
        displayCreatedSousReseaux(createSousReseaux(NA));
      }
    }
  }
});

nbrSousReseau.addEventListener("change", (e) => {
  let selectedOption = e.target.options[e.target.selectedIndex];
  let maxMachine = parseInt(nbrMachine.lastChild.previousSibling.value);
  let maxSousReseau = parseInt(nbrSousReseau.lastChild.previousSibling.value);
  if (selectedOption.value != "Other") {
    nbrMachine.value = maxMachine / parseInt(nbrSousReseau.value);
    displayCreatedSousReseaux(createSousReseaux(NA));
  } else {
    do {
      var userInput = prompt(
        "Please enter a Subnets Number of your choice:",
        ""
      );
      number = parseInt(userInput);
    } while (
      number > maxSousReseau ||
      number == 0 ||
      userInput == "" ||
      userInput == null
    );
    for (let i = 0; i < nbrSousReseau.options.length; i++) {
      if (findNextPowerOfTwo(number) == nbrSousReseau.options[i].value) {
        nbrSousReseau.value = findNextPowerOfTwo(number);
        nbrMachine.value = maxMachine / parseInt(nbrSousReseau.value);
        displayCreatedSousReseaux(createSousReseaux(NA));
      }
    }
  }
});
