from app.models.base import BaseModel

class Amenity(BaseModel):
    """
    Represents an amenity that can be associated with a place.
    """
    def __init__(self, name):
        """
        Initialize a new amenity.
        """
        super().__init__()
        self.name = name

    @property
    def name(self):
        """
        Get the amenity's name.
        """
        return self.__name

    @name.setter
    def name(self, value):
        """
        Set the amenity's name.
        """
        self.__name = value
