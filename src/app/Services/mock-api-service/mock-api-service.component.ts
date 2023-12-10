import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockApiServiceComponent {
  constructor(private httpClient: HttpClient) { }

  retrieveUserList()  {
    //console.log("fetching users");
    //Step 1: call API to get mock users.
    return this.httpClient.get(`https://my.api.mockaroo.com/customers.json?key=03c46990`);
  }

  public saveUser(user: any): Observable<any> {
    return this.httpClient.post<any>('https://my.api.mockaroo.com/customers.json?key=03c46990', user);
  }
}
