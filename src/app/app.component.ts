import { Component, OnInit } from '@angular/core';

import { FairwindsMockUser } from './fairwinds-mock-user';
import { ModalServiceComponent } from './Services/modal-service/modal-service.component';
import { NewUserModalComponent } from './new-user-modal/new-user-modal.component';
import { FormGroup, FormControl, Validators, ValidatorFn, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MockApiServiceComponent } from './Services/mock-api-service/mock-api-service.component';
import { DatePipe } from '@angular/common';
import { state } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  filterString: Array<string> = [''];
  filtersUsed: number = 1;
  currentFilterValue: string = '';
  filteredUserList: Array<any> =[];
  sortOrder: number = 1; //positive for UP, negative for DOWN
  currentSortProperty: string = '';
  errorList: Array<string> = [];
  title = 'FairwindsTest';
  loading: boolean = true;

  currentlySelectedUser: FairwindsMockUser = {
    id: 0,
    firstName: '',
    lastName: '',
    dob: new Date(),
    ssn: '',
    age: 0,
    emailAddress: '',
    primaryAddress: '',
    phoneNumber: '',
    joinDate: new Date()
  };
  userList: Array<FairwindsMockUser> = [];
  newUserForm: any;
  filterForm: any;
  constructor(private formBuilder: FormBuilder, protected modalService: ModalServiceComponent, protected mockApiService: MockApiServiceComponent, private datePipe: DatePipe) {
    this.createNewUserForm();
    this.createNewFilterForm();
  }
  public get StateEnum() {
    return StateList;
  }
  ngOnInit(): void {
    this.mockApiService.retrieveUserList().subscribe((data: any) => {

      data.forEach((user: any) => {
        let loadUser: FairwindsMockUser = {
          id: user.customer_number,
          firstName: user.first_name,
          lastName: user.last_name,
          dob: user.date_birth,
          ssn: user.ssn,
          age: Math.floor(((Math.abs(Date.now() - (new Date(user.date_birth).getTime()))) / (1000 * 3600 * 24)) / 365.25),
          emailAddress: user.email,
          primaryAddress: user.primary_address.address_line_1 + ', ' + user.primary_address.city + ' ' + user.primary_address.state + ', ' + user.primary_address.zip_code,
          phoneNumber: user.mobile_phone_number,
          joinDate: user.join_date
        };
        this.userList.push(loadUser);
      });
      this.loading = false;

      this.createFilterList(this.filterForm.value);
    });
  }

  /***
   * Helper function used only by constructor, creates formgroup data, adds basic validation
   */
  createNewUserForm() {
    this.newUserForm = new FormGroup({
      firstName: new FormControl('', [
        this.patternWithMessage(/[A-Z]/, 'First Character MUST be Uppercase'),
        Validators.required, Validators.minLength(2)
      ]),
      lastName: new FormControl('', [
        Validators.required, Validators.minLength(2)
      ]),
      dob: new FormControl('', [Validators.required]),
      emailAddress: new FormControl('', [
        Validators.required,
        this.patternWithMessage(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/, 'Please enter a valid email address'),
      ]),
      ssn: new FormControl('', [
        Validators.required, Validators.minLength(9), Validators.maxLength(9),
        this.patternWithMessage(/^[0-9]*$/, 'Social security number may only contain digits')
        //this.patternWithMessage(/[A-Z]/, 'First Character MUST be Uppercase'),
      ]),
      streetAddress: new FormControl('', [Validators.required]),
      cityAddress: new FormControl('', [Validators.required, this.patternWithMessage(/^[^0-9()]+$/, 'City name cannot have digits')]),
      stateAddress: new FormControl('', [Validators.required, this.patternWithMessage(/^[^0-9()]+$/, 'State name cannot have digits')]),
      zipAddress: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(5), this.patternWithMessage(/^[0-9]*$/, 'ZIP code may only contain digits')]),
      phoneNumber: new FormControl('', [
        this.patternWithMessage(/^[0-9]*$/, 'Phone number may only contain digits'),
        Validators.minLength(9)
      ]),
    });
  }

  createNewFilterForm() {
    this.filterForm = new FormGroup({
      filter0: new FormControl('', []),
      filter1: new FormControl('', []),
      filter2: new FormControl('', [])
    });
  }

  newUser: FairwindsMockUser = {
    id: 0,
    firstName: '',
    lastName: '',
    dob: new Date(),
    ssn: '',
    age: 0,
    emailAddress: '',
    primaryAddress: '',
    phoneNumber: '',
    joinDate: new Date,

  };


  /**
   * Creates a validator function to be used in formControl objects
   * @param pattern regex expression
   * @param message messsage to give if regex fails
   * @returns the validatorFn utilized by FormControl objects
   */
  patternWithMessage(pattern: string | RegExp, message: string): ValidatorFn {
    const delegateFn = Validators.pattern(pattern)
    return control => delegateFn(control) === null ? null : { message }
  }

  /**
   * Template Form submit function 
   * @param newUser data from form
   */
  onSubmitTemplateBased(newUser: any) {
    this.errorList = [];
    //combine address fields
    newUser.primaryAddress = newUser.streetAddress + ', ' + newUser.cityAddress + ' ' + newUser.stateAddress + ', ' + newUser.zipAddress;
    //calculate AGE variable
    let userAgeInMilliseconds = new Date(newUser.dob).getTime();
    let dateDifference = Math.abs(Date.now() - userAgeInMilliseconds)
    newUser.age = Math.floor((dateDifference / (1000 * 3600 * 24)) / 365.25);
    //run basic validation on DOB (should not be the future)
    newUser.dob = this.datePipe.transform(newUser.dob, 'MM/dd/yyyy');

    //set Join Date:
    newUser.joinDate = this.datePipe.transform(new Date(), 'MM/dd/yyyy');
    //create userId for this new user (just random)
    newUser.id = Math.floor((Math.random() * 100000) + 1).toString();
    while (newUser.id.length < 5) {
      newUser.id = '0' + newUser.id;
    }
    newUser.ssn = newUser.ssn.toString();
    //run basic validation on DOB (should not be in the future)
    if (userAgeInMilliseconds - Date.now() > 0) {
      this.errorList.push('Date of Birth CANNOT be in the future');
    }


    //run basic validation on social security number (should be 9 digits)
    let ssnString = newUser.ssn.toString();
    if (ssnString.length != 9) {
      this.newUserForm.dirty;
      this.errorList.push('Social Security Number should be exactly 9 digits');
    }
    this.userList.map(user => {
      let trimmedSSN = user.ssn ? user.ssn : "";
      while (trimmedSSN.includes("-")) {
        trimmedSSN = trimmedSSN.replace("-", "");
      }
      if (trimmedSSN === ssnString) {
        this.errorList.push('ERROR: Please contact customer service. (Dev Note:SSN already on system, this is not to be revealed to user)')
      }
    });

    if (this.errorList.length == 0) {
      this.mockApiService.saveUser(newUser).subscribe(val => {
        if (val == 201) {
          this.userList.push(newUser);
          this.createFilterList(this.filterForm.value);
          this.sortOrder = 1;
          this.modalService.close();
        } else {
          console.log('Received a status OTHER than 201');
        }
      });
    }
  }

  /**
   * called by filter modal to add another filter Option
   */
  addFilterOption() {
    this.filtersUsed++;
  }

  /**
   * called by filter modal to REMOVE last filter option
   */
  removeFilterOption() {
    this.filtersUsed--;
    this.createFilterList(this.filterForm.value);
  }

  /**
   * Function called by submit of filter modal
   * @param filterValues
   */
  closeFilterModal(filterValues:any) {
    this.createFilterList(filterValues);
    this.modalService.close();
  }

  clearFilter() {
    this.filterString = [''];
    this.filtersUsed = 1;
    this.filterForm.value['filter0'] = '';
    this.filterForm.value['filter1'] = '';
    this.filterForm.value['filter2'] = '';
    this.createNewFilterForm();
    this.createFilterList(this.filterForm.value);
  }


  /**
   * Template call to open the "create user" modal
   */
  newUserModalOpen(): void {
    this.createNewUserForm();
    this.modalService.open('newUser-modal');
  }

  /**
   * template call to display all user information within a modal
   * @param user the selected user
   */
  userDetailModalOpen(user: FairwindsMockUser): void {
    this.currentlySelectedUser = user;
    this.modalService.open('userDetails-modal');
  }

  filterModalOpen(): void {
    this.modalService.open('filter-modal')
  }

  /**
   * Used by customer table to sort based on selected column name.
   * NOTE: As of this time, this is unable to sort by properties of nested objects inside the array of objects.
   * @param property the property name of the array of objects to be sorted.
   */

  sortList(property: string) {
    if (property == '') {
      property = this.currentSortProperty;
    }
    if (this.currentSortProperty != property) {
      this.sortOrder = -1; //this will trigger sort down when selecting a property that isnt the current sort target
    }
    this.currentSortProperty = property;
    let sortList = this.userList;
      if (this.currentSortProperty == 'dob') {
        sortList = this.userList.sort((this.dateSort()));
      } else {
        sortList = this.userList.sort((this.dynamicSort(property)));
      }
      this.userList = sortList;
    this.createFilterList(this.filterForm.value);
      this.sortOrder = this.sortOrder * -1;
  }

  /**
   * Given property parameter, returns a function with the specified property name to be utilized by Array.sort function
   * @param property
   * @returns
   */
  dynamicSort(property:string) {
  var sortOrderCopy = this.sortOrder;
    return function (a: any, b: any) {
      var result = 0;
      // Account for names that start with lowercase.
      if (typeof a[property] === 'string') {
        let lowerCaseA = a[property].toLowerCase();
        let lowerCaseB = a[property].toLowerCase();
        result = (lowerCaseA < lowerCaseB) ? -1 : (lowerCaseA > lowerCaseB) ? 1 : 0;
      } else {
        result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      }
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrderCopy;
  }
  }

  /**
   * dynamic sort expects values to be strings/numbers, this sort handles the Date value edge case
   */
  dateSort() {
    var sortOrderCopy = this.sortOrder;
    return function (a: any, b: any) {
      var result = (new Date(a.dob) < new Date(b.dob)) ? -1 : (new Date(a.dob) > new Date(b.dob)) ? 1 : 0;
      return result * sortOrderCopy;
    }
  }


  /**
   * Called everytime UserList is updated.
   * used in conjunction with filter input on template
   */
  createFilterList(filterValues: any): void {
    console.log(filterValues);
    this.filteredUserList = this.userList;
    this.filterString = ['','',''];
    if (filterValues) {
      if (filterValues.filter0 != '') {
        this.filterString[0] = filterValues.filter0;
      }
      if (filterValues.filter1 != '') {
        this.filterString[1] = filterValues.filter1;
      }
      if (filterValues.filter2 != '') {
        this.filterString[2] = filterValues.filter2;
      }
    }
    let removeBlanks: Array<string>= [];
    this.filterString.map(filter => {
      if (filter != '' && filter !=undefined) {
        removeBlanks.push(filter);
      }
    });
    this.filterString = removeBlanks;
    
    if (this.filterString.length==0) {
    } else {
      //Loop through the filterString array
      this.filterString.map(filter => {
        let newFilteredUserList:Array<any> = [];
        this.filteredUserList.map(val => {
          if (val.id.toString().includes(filter) ||
            val.firstName.toLowerCase().includes(filter.toLowerCase()) ||
            val.lastName.toLowerCase().includes(filter.toLowerCase()) ||
            val.age.toString().includes(filter) ||
            (val.dob && val.dob.toString().includes(filter)) ||
            (val.ssn && val.ssn.substr(val.ssn.length - 4).includes(filter))) {
            newFilteredUserList.push(val);
          }
        });
        this.filteredUserList = newFilteredUserList;
      })
    }

  }
}

export enum StateList {
  AL = 'Alabama',
  AK = 'Alaska',
  AZ = 'Arizona',
  AR = 'Arkansas',
  CA = 'California',
  CO = 'Colorado',
  CT = 'Connecticut',
  DE = 'Delaware',
  FL = 'Florida',
  GA = 'Georgia',
  HI = 'Hawaii',
  ID = 'Idaho',
  IL = 'Illinois',
  IN = 'Indiana',
  IA = 'Iowa',
  KS = 'Kansas',
  KY = 'Kentucky',
  LA = 'Louisiana',
  ME = 'Maine',
  MD = 'Maryland',
  MA = 'Massachusetts',
  MI = 'Michigan',
  MN = 'Minnesota',
  MS = 'Mississippi',
  MO = 'Missouri',
  MT = 'Montana',
  NE = 'Nebraska',
  NV = 'Nevada',
  NH = 'New Hampshire',
  NJ = 'New Jersey',
  NM = 'New Mexico',
  NY = 'New York',
  NC = 'North Carolina',
  ND = 'North Dakota',
  OH = 'Ohio',
  OK = 'Oklahoma',
  OR = 'Oregon',
  PA = 'Pennsylvania',
  RI = 'Rhode Island',
  SC = 'South Carolina',
  SD = 'South Dakota',
  TN = 'Tennessee',
  TX = 'Texas',
  UT = 'Utah',
  VT = 'Vermont',
  VA = 'Virginia',
  WA = 'Washington',
  WV = 'West Virginia',
  WI = 'Wisconsin',
  WY = 'Wyoming',
}
