import { Entity, MikroORM, PrimaryKey, Property } from '@mikro-orm/sqlite';

@Entity()
class User {

  @PrimaryKey()
  id!: number;

  @Property()
  name: string;

  @Property({ unique: true })
  email: string;

  @Property({ lazy: true })
  password: string;

  @Property({ lazy: true })
  OTPSecret: string;

  constructor(name: string, email: string, password: string, otpSecret: string) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.OTPSecret = otpSecret;
  }

}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ':memory:',
    entities: [User],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('basic CRUD example', async () => {
  orm.em.create(User, { name: 'Foo', email: 'foo', password: 'PA$$W0RD', OTPSecret: 'S3cr3t' });
  await orm.em.flush();
  orm.em.clear();

  let user = await orm.em.findOneOrFail(User, { email: 'foo' }, { exclude: ['OTPSecret'], populate: ['password'] });
  expect(user?.password).toBe('PA$$W0RD');
  expect(user?.OTPSecret).not.toBeDefined();

  user = await orm.em.findOneOrFail(User, { email: 'foo' }, { exclude: ['password'], populate: ['OTPSecret'] })
  expect(user?.OTPSecret).toBe('S3cr3t');
  expect(user?.password).not.toBeDefined();
});
