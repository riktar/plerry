import {Test} from "../helper";
import {test} from "tap";
import Plerry from "../../src/Plerry";
import sinon from "sinon";

test('build plerry', async (t: Test) => {
  t.plan(1)
  const plerry = new Plerry()
  await t.resolves(plerry.ready())
})

test('test plerry close', async (t: Test) => {
  const plerry = new Plerry()
  const app = await plerry.ready()

  const cb = sinon.fake()
  app.on("plerry:close", cb)

  app.close()
  t.equal(cb.callCount, 1);
})

test('test plerry decorate', async (t: Test) => {
  const plerry = new Plerry()
  const app = await plerry.ready()

  const cb = sinon.fake()
  app.decorate("go", cb)

  // @ts-ignore
  app.go()

  t.equal(cb.callCount, 1);
})