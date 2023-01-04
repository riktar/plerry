import {Test} from "../helper";
import {test} from "tap";
import Plerry, {PlerryInstance} from "../../src/Plerry";
import sinon from "sinon";

test('register a plugin', async (t: Test) => {
  t.plan(2)
  const plerry = new Plerry()
  const cb = sinon.fake()
  plerry.register(async (app: PlerryInstance) => {
    app.decorate('test', cb)
  }, {name: 'test'})

  try {
    plerry.register(async (app: PlerryInstance) => {
      app.decorate('test', cb)
    }, {name: 'test'})
  } catch (e) {
    t.ok(true)
  }

  const app = await plerry.ready()

  // @ts-ignore
  app.test()
  t.equal(cb.callCount, 1);
})

test('dependencies register order', async (t: Test) => {
  const plerry = new Plerry()
  const executionOrder: string[] = []

  plerry.register(() => {
    executionOrder.push('test1')
  }, {name: 'test1', dependencies: ['test2']})

  plerry.register(async () => {
    executionOrder.push('test2')
  }, {name: 'test2'})

  plerry.register(async (app: PlerryInstance) => {
    executionOrder.push('test3')
    app.register(async () => {
      executionOrder.push('test5')
    }, {name: 'test5'})
  }, {name: 'test3', dependencies: ['test1', 'test2']})

  plerry.register(async () => {
    executionOrder.push('test4')
  }, {name: 'test4'})


  await plerry.ready()
  t.equal(executionOrder[0], 'test2')
  t.equal(executionOrder[1], 'test4')
  t.equal(executionOrder[2], 'test1')
  t.equal(executionOrder[3], 'test3')
  t.equal(executionOrder[4], 'test5')
})


test('plerry reload and re register plugins', async (t: Test) => {
  const plerry = new Plerry()
  let executionOrder: string[] = []

  plerry.register(() => {
    executionOrder.push('test1')
  }, {name: 'test1', dependencies: ['test2']})
  plerry.register(async () => {
    executionOrder.push('test2')
  }, {name: 'test2'})
  plerry.register(async (app: PlerryInstance) => {
    executionOrder.push('test3')
    app.register(async () => {
      executionOrder.push('test5')
    }, {name: 'test5', dependencies: ['test3']})
  }, {name: 'test3', dependencies: ['test1', 'test2']})
  plerry.register(async () => {
    executionOrder.push('test4')
  }, {name: 'test4'})

  await plerry.ready()
  t.equal(executionOrder.length, 5)

  executionOrder = []

  plerry.register(async () => {
    executionOrder.push('test6')
  }, {name: 'test6'})

  await plerry.reload()
  t.equal(executionOrder.length, 6)
})