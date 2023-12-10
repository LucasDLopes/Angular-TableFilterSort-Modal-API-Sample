export class FairwindsMockUser {

  id: number;
  firstName: string;
  lastName: string;
  dob: Date;
  ssn: string;
  age: number;
  emailAddress: string;
  primaryAddress: string;
  phoneNumber: string;
  joinDate: Date;
  constructor(data: any) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.dob = data.dob;
    this.ssn = data.ssn
    this.age = Math.floor(((Math.abs(Date.now() - data.dob.getTime())) / (1000 * 3600 * 24)) / 365.25);
    this.emailAddress = data.emailAddress;
    this.primaryAddress = data.primaryAddress;
    this.phoneNumber = data.phoneNumber;
    this.joinDate = data.joinDate
  }
}
