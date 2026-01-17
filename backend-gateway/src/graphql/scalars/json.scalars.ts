import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('JSON')
export class JSONScalar implements CustomScalar<any, any> {
  description = 'Custom JSON scalar';

  parseValue(value: any): any {
    return value;
  }

  serialize(value: any): any {
    return value;
  }

  parseLiteral(ast: ValueNode): any {
    if (ast.kind === Kind.OBJECT) {
      throw new Error('Not implemented');
    }
    return null;
  }
}
