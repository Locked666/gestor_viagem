class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None, success=False):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload
        self.success = success

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        rv['success'] = self.success

        return rv
        
