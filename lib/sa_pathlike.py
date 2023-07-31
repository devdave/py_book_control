from typing import Any, Optional
import pathlib

import sqlalchemy.types as satypes
from sqlalchemy import Dialect


class SAPathlike(satypes.TypeDecorator):
    impl = satypes.Text

    cache_ok = True

    def process_bind_param(self, value: Optional, dialect: Dialect) -> Any:
        return str(value)

    def process_result_value(self, value: Optional[Any], dialect: Dialect) -> Optional:
        return pathlib.Path(value)
