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
  timeout?: number
  aborted: boolean
  startTime?: number
  endTime?: number
  request: HttpRequest
  response: HttpResponse
}