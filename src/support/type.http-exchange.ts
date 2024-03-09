/**
 * maybe I should create more granular types for the request and response objects and then use those
 * types in the HttpExchange type. I'm not sure if I'll ever need to do that though.
 */

export type NameValuePair = {
  name: string
  value: string
}

export type HttpRequest = {
  id: string
  method: string
  url: string
  headers: NameValuePair[]
  body?: string
}

export type HttpResponse = {
  statusCode: number
  headers: NameValuePair[]
  body?: string
}

export type HttpExchange = {
  timedout: boolean
  aborted: boolean
  startTime?: number
  endTime?: number
  request: HttpRequest
  response: HttpResponse
}