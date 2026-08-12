import { describe, expect, it } from 'vitest'
import { mergeDataAccessPlans } from '@/foundation/modules/authorization/authorization.service.js'

const userA = '0198f31a-0000-7000-8000-000000000007'
const userB = '0198f31a-0000-7000-8000-000000000008'
const departmentA = '0198f31a-0000-7000-8000-000000000002'
const departmentB = '0198f31a-0000-7000-8000-000000000003'
const departmentC = '0198f31a-0000-7000-8000-000000000004'

// 数据范围采用默认拒绝和允许并集语义；任一 all 规则会短路为无限制。
describe('authorization data-scope union', () => {
  it('denies by default when no policy contributes a range', () => {
    expect(mergeDataAccessPlans([])).toEqual({
      unrestricted: false,
      ownerUserIds: [],
      departmentIds: [],
    })
  })

  it('unions user and department ranges without duplicates', () => {
    expect(
      mergeDataAccessPlans([
        { unrestricted: false, ownerUserIds: [userA], departmentIds: [departmentA, departmentB] },
        {
          unrestricted: false,
          ownerUserIds: [userA, userB],
          departmentIds: [departmentB, departmentC],
        },
      ]),
    ).toEqual({
      unrestricted: false,
      ownerUserIds: [userA, userB],
      departmentIds: [departmentA, departmentB, departmentC],
    })
  })

  it('short-circuits to unrestricted when any policy grants all', () => {
    expect(
      mergeDataAccessPlans([
        { unrestricted: false, ownerUserIds: [userA], departmentIds: [departmentA] },
        { unrestricted: true, ownerUserIds: [], departmentIds: [] },
      ]),
    ).toEqual({ unrestricted: true, ownerUserIds: [], departmentIds: [] })
  })
})
