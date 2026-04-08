import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService { 
  getHello(): string {
    return 'Aplicação Data Bridge Integrator API 1.0 rodando! ';
  }
}
