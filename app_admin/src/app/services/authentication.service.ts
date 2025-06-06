import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/authresponse';
import { TripDataService } from './trip-data.service';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripDataService
  ) {}

  public getToken(): string {
    return this.storage.getItem('travlr-token')!;
  }

  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
  }
  public login(user: User): Observable<void> {
    return this.tripDataService.login(user).pipe(
      tap((authResp: AuthResponse) => this.saveToken(authResp.token)),
      map(() => undefined)
    );
  }

  public register(user: User): Observable<void> {
    return this.tripDataService.register(user).pipe(
      tap((authResp: AuthResponse) => this.saveToken(authResp.token)),
      map(() => undefined)
    );
  }
  public logout(): void {
    this.storage.removeItem('travlr-token');
  }
  public isLoggedIn(): boolean {
    const token: string = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    }
    return false;
  }
  public getCurrentUser() {
    if (this.isLoggedIn()) {
      const token: string = this.getToken();
      const { email, name } = JSON.parse(atob(token.split('.')[1]));
      return { email, name } as User;
    }
    return null;
  }
}

