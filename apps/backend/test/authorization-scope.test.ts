import { describe, expect, it } from 'vitest'
import { mergeDataAccessPlans } from '@/modules/authorization/authorization.service.js'

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
        { unrestricted: false, ownerUserIds: [7], departmentIds: [2, 3] },
        { unrestricted: false, ownerUserIds: [7, 8], departmentIds: [3, 4] },
      ]),
    ).toEqual({
      unrestricted: false,
      ownerUserIds: [7, 8],
      departmentIds: [2, 3, 4],
    })
  })

  it('short-circuits to unrestricted when any policy grants all', () => {
    expect(
      mergeDataAccessPlans([
        { unrestricted: false, ownerUserIds: [7], departmentIds: [2] },
        { unrestricted: true, ownerUserIds: [], departmentIds: [] },
      ]),
    ).toEqual({ unrestricted: true, ownerUserIds: [], departmentIds: [] })
  })
})
